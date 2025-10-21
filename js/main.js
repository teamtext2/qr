document.addEventListener('DOMContentLoaded', function () {
    // --- Elements ---
    const textInput = document.getElementById('textInput');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const qrResultContainer = document.getElementById('qr-result-container');
    const qrContainer = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    let debounceTimer;

    // --- Theme Management ---
    const userTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const themeCheck = () => {
        if (userTheme === 'dark' || (!userTheme && systemTheme)) {
            document.documentElement.classList.add('dark');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    };

    const themeSwitch = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        themeCheck();
    };

    themeToggle.addEventListener('click', themeSwitch);
    themeCheck();

    // --- Color Pickers ---
    const createPicker = (el, defaultColor) => {
        return Pickr.create({
            el,
            theme: 'classic',
            default: defaultColor,
            swatches: [
                '#000000', '#FFFFFF', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
            ],
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: true,
                    rgba: true,
                    input: true,
                    save: true
                }
            }
        }).on('save', () => generateQR());
    };
    const darkPicker = createPicker('#darkColor', '#000000');
    const lightPicker = createPicker('#lightColor', '#ffffff');


    // --- QR Code Generation ---
    const generateQR = () => {
        const text = textInput.value.trim();
        if (!text) {
            qrPlaceholder.classList.remove('hidden');
            qrResultContainer.classList.add('hidden');
            return;
        }

        const darkColor = darkPicker.getColor().toHEXA().toString();
        const lightColor = lightPicker.getColor().toHEXA().toString();
        
        qrContainer.innerHTML = ''; // Clear previous QR

        QRCode.toCanvas(text, {
            width: 500, // High resolution for better quality
            margin: 1,
            color: {
                dark: darkColor,
                light: lightColor
            },
            errorCorrectionLevel: 'H' // High
        }, function (error, canvas) {
            if (error) {
                console.error(error);
                alert("An error occurred while generating the QR code. Please try again!");
                return;
            }
            
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.style.borderRadius = "0.75rem"; // rounded-xl
            qrContainer.appendChild(canvas);

            // Update UI
            qrPlaceholder.classList.add('hidden');
            qrResultContainer.classList.remove('hidden');

            // Set download link
            const dataUrl = canvas.toDataURL('image/png');
            downloadLink.href = dataUrl;
            downloadLink.download = `qr-code-text2-${Date.now()}.png`;
        });
    };

    // --- Event Listeners ---
    textInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQR, 300); // Debounce for smoother experience
    });
    
    // Generate QR with Ctrl+Enter
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
           e.preventDefault();
           clearTimeout(debounceTimer);
           generateQR();
        }
    });
});