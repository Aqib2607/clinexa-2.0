<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Base validation rules
        $rules = [
            'role' => 'required|in:patient,doctor,nurse,super_admin',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => ['required', Password::min(8)],
            'password_confirmation' => 'required|same:password',
        ];

        // Add role-specific validation rules
        if ($request->role === 'patient') {
            $rules['dob'] = 'required|date';
            $rules['gender'] = 'required|in:male,female,other';
            $rules['address'] = 'required|string';
        } elseif ($request->role === 'doctor') {
            $rules['specialization'] = 'required|string|max:255';
            $rules['license_number'] = 'required|string|max:255';
            $rules['department_id'] = 'required|integer|exists:departments,id';
        } elseif ($request->role === 'nurse') {
            $rules['employee_code'] = 'required|string|max:255';
            $rules['designation'] = 'required|string|max:255';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::error('Registration validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            // Create role-specific record
            switch ($request->role) {
                case 'patient':
                    Patient::create([
                        'uhid' => 'P' . date('Ymd') . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'dob' => $request->dob,
                        'gender' => $request->gender,
                        'address' => $request->address,
                    ]);
                    break;

                case 'doctor':
                    Doctor::create([
                        'user_id' => $user->id,
                        'specialization' => $request->specialization,
                        'license_number' => $request->license_number,
                        'department_id' => $request->department_id,
                    ]);
                    break;

                case 'nurse':
                    $employee = \App\Models\Employee::create([
                        'user_id' => $user->id,
                        'employee_code' => $request->employee_code,
                        'designation' => $request->designation,
                        'join_date' => now(), // Default join date as today
                        'email' => $user->email,
                        'phone' => $request->phone,
                    ]);
                    break;
            }

            // Generate auth token
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|in:patient,doctor,nurse,super_admin',
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->where('role', $request->role)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }
}
