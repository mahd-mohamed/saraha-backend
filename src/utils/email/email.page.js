export const OTPTemplate = (otp) => {
    const copyOtp = async () => {
        try {
            await navigator.clipboard.writeText(otp);
            const button = document.getElementById('copyButton');
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = 'orange';
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy OTP: ', err);
            const button = document.getElementById('copyButton');
            if (button) {
                button.textContent = 'Copy Failed';
                button.style.backgroundColor = '#f44336';
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.style.backgroundColor = 'orange';
                }, 2000);
            }
        }
    };
    
    return `
    <style>
    body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: rgb(230, 158, 70);
    }

    .container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    border-radius: 15px;
    background-color: rgb(240, 240, 240);
    justify-content: center;
    align-items: flex-end;
    }

    p {
        font-size: 24px;
        padding: 10px;
        
        text-align: center;
    }
    </style>

    <div class="container">
    <p>Your otp is <span style="color: orange; font-size: 24px; font-weight: bold;">${otp}</span></p>
    </div>
    `;
}

