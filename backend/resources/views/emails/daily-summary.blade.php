<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Hospital Summary</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }

        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Daily Hospital Summary</h1>
        <p>{{ now()->format('l, F j, Y') }}</p>
    </div>

    <div class="content">
        <p>Hello,</p>
        <p>Here's your daily summary of hospital activities:</p>

        <div class="stat-card">
            <div class="stat-label">Total Appointments</div>
            <div class="stat-value">{{ $data['appointments'] ?? 0 }}</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">New Patients</div>
            <div class="stat-value">{{ $data['patients'] ?? 0 }}</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">Revenue Generated</div>
            <div class="stat-value">${{ number_format($data['revenue'] ?? 0, 2) }}</div>
        </div>

        @if(isset($data['admissions']))
        <div class="stat-card">
            <div class="stat-label">Active Admissions</div>
            <div class="stat-value">{{ $data['admissions'] }}</div>
        </div>
        @endif

        <p style="margin-top: 30px;">
            <strong>Note:</strong> This is an automated daily summary email.
            You can manage your notification preferences in the system settings.
        </p>
    </div>

    <div class="footer">
        <p>&copy; {{ now()->format('Y') }} Clinexa Hospital. All rights reserved.</p>
        <p>This email was sent to {{ $data['recipient_email'] ?? 'you' }}</p>
    </div>
</body>

</html>