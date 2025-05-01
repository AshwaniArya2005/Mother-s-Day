// Interactive Card
const motherCard = document.querySelector('.mother-card');
motherCard.addEventListener('click', () => {
    motherCard.classList.toggle('opened');
});

// Virtual Bouquet Builder
const flowers = document.querySelectorAll('.flower');
const bouquetCanvas = document.querySelector('.bouquet-canvas');
const clearBtn = document.querySelector('.clear-btn');
const confirmBtn = document.querySelector('.confirm-btn');
const vase = document.querySelector('.vase');
const finalBouquet = document.querySelector('.final-bouquet');

// Modal elements
const modal = document.getElementById('bouquetModal');
const closeModal = document.querySelector('.close-modal');
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const printBtn = document.querySelector('.print-btn');
const personalMessage = document.getElementById('personalMessage');

// Add event listeners
confirmBtn.addEventListener('click', arrangeBouquet);
updateConfirmButton(); // Initial button state

flowers.forEach(flower => {
    flower.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.src);
        e.target.style.opacity = '0.5';
    });

    flower.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
    });
});

bouquetCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

bouquetCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const flowerSrc = e.dataTransfer.getData('text/plain');
    const newFlower = document.createElement('img');
    newFlower.src = flowerSrc;
    newFlower.classList.add('flower');
    newFlower.style.position = 'absolute';
    
    // Calculate position relative to the canvas
    const rect = bouquetCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Center the flower on the cursor
    newFlower.style.left = `${x - 30}px`;
    newFlower.style.top = `${y - 30}px`;
    
    // Add draggable functionality to placed flowers
    newFlower.draggable = true;
    newFlower.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'move');
        e.target.style.opacity = '0.5';
    });
    
    newFlower.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
    });
    
    bouquetCanvas.appendChild(newFlower);
    updateConfirmButton();
});

// Clear bouquet functionality
clearBtn.addEventListener('click', () => {
    clearBouquet();
    updateConfirmButton();
});

function clearBouquet() {
    const placedFlowers = bouquetCanvas.querySelectorAll('.flower');
    placedFlowers.forEach(flower => {
        flower.remove();
    });
    bouquetCanvas.classList.remove('arranging');
    vase.classList.remove('arranging');
    
    // Reset wrapping paper
    const wrappingPaper = bouquetCanvas.querySelector('.wrapping-paper');
    wrappingPaper.classList.remove('show', 'wrapped');
}

function updateConfirmButton() {
    const placedFlowers = bouquetCanvas.querySelectorAll('.flower');
    confirmBtn.disabled = placedFlowers.length === 0;
}

function arrangeBouquet() {
    console.log('Arranging bouquet...'); // Debug log
    const placedFlowers = Array.from(bouquetCanvas.querySelectorAll('.flower'));
    if (placedFlowers.length === 0) return;

    // Disable buttons during animation
    confirmBtn.disabled = true;
    clearBtn.disabled = true;

    // Add animation classes
    bouquetCanvas.classList.add('arranging');
    vase.classList.add('arranging');
    placedFlowers.forEach(flower => flower.classList.add('arranging'));

    // Calculate center point just above the vase
    const centerX = bouquetCanvas.offsetWidth / 2;
    const centerY = vase.offsetTop - 50;

    // Arrange flowers in a circular pattern
    placedFlowers.forEach((flower, index) => {
        const angle = (index / placedFlowers.length) * Math.PI * 2;
        const radius = 40;
        const x = centerX + Math.cos(angle) * radius - 30;
        const y = centerY + Math.sin(angle) * radius - 30;

        // Random rotation for natural look
        const rotation = Math.random() * 30 - 15;

        setTimeout(() => {
            flower.style.left = `${x}px`;
            flower.style.top = `${y}px`;
            flower.style.transform = `rotate(${rotation}deg)`;
            flower.classList.add('arranged');
        }, index * 100);
    });

    // Add wrapping paper animation
    const wrappingPaper = bouquetCanvas.querySelector('.wrapping-paper');
    setTimeout(() => {
        wrappingPaper.classList.add('show');
        setTimeout(() => {
            wrappingPaper.classList.add('wrapped');
        }, 100);
    }, placedFlowers.length * 100 + 400);

    // Capture the bouquet as image after arrangement and wrapping
    setTimeout(() => {
        html2canvas(bouquetCanvas).then(canvas => {
            const finalBouquetImage = document.getElementById('finalBouquetImage');
            finalBouquetImage.innerHTML = '';
            finalBouquetImage.appendChild(canvas);
            
            // Show modal
            modal.classList.add('show');
        });
    }, placedFlowers.length * 100 + 1200); // Increased delay to account for wrapping animation
}

// Modal functions
closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
    // Reset the bouquet canvas
    clearBouquet();
    confirmBtn.disabled = false;
    clearBtn.disabled = false;
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    const canvas = document.querySelector('#finalBouquetImage canvas');
    if (!canvas) return;

    // Create a new canvas with space for the message
    const message = personalMessage.value;
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    // Set canvas size to accommodate message
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height + (message ? 100 : 0);
    
    // Draw original bouquet
    ctx.fillStyle = '#fff5f8';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    
    // Add message if exists
    if (message) {
        ctx.font = '16px Poppins';
        ctx.fillStyle = '#d81b60';
        ctx.textAlign = 'center';
        const words = message.split(' ');
        let line = '';
        let y = canvas.height + 30;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > canvas.width - 40) {
                ctx.fillText(line, finalCanvas.width/2, y);
                line = word + ' ';
                y += 25;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, finalCanvas.width/2, y);
    }

    // Convert to image and download
    const link = document.createElement('a');
    link.download = 'mothers-day-bouquet.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
});

// Share functionality
shareBtn.addEventListener('click', async () => {
    const canvas = document.querySelector('#finalBouquetImage canvas');
    if (!canvas) return;

    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const file = new File([blob], 'mothers-day-bouquet.png', { type: 'image/png' });
        const shareData = {
            title: 'Mother\'s Day Bouquet',
            text: personalMessage.value || 'A virtual bouquet for Mother\'s Day!',
            files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            alert('Sharing is not supported on this device/browser');
        }
    } catch (err) {
        console.error('Error sharing:', err);
        alert('Could not share the bouquet');
    }
});

// Print functionality
printBtn.addEventListener('click', () => {
    const canvas = document.querySelector('#finalBouquetImage canvas');
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    const message = personalMessage.value;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Mother's Day Bouquet</title>
                <style>
                    body { 
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    img { max-width: 100%; }
                    .message {
                        margin-top: 20px;
                        color: #d81b60;
                        text-align: center;
                        font-size: 16px;
                        max-width: 500px;
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                <img src="${canvas.toDataURL()}" alt="Mother's Day Bouquet">
                ${message ? `<div class="message">${message}</div>` : ''}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
});

// Countdown Timer
function getNextMothersDay() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Mother's Day is the second Sunday in May
    let mothersDay = new Date(currentYear, 4, 1); // May 1st
    
    // Find the first Sunday
    while (mothersDay.getDay() !== 0) {
        mothersDay.setDate(mothersDay.getDate() + 1);
    }
    
    // Add 7 days to get to the second Sunday
    mothersDay.setDate(mothersDay.getDate() + 7);
    
    // If Mother's Day has passed this year, get next year's date
    if (now > mothersDay) {
        mothersDay = new Date(currentYear + 1, 4, 1);
        while (mothersDay.getDay() !== 0) {
            mothersDay.setDate(mothersDay.getDate() + 1);
        }
        mothersDay.setDate(mothersDay.getDate() + 7);
    }
    
    return mothersDay;
}

function createConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ff69b4', '#ff8da1', '#ffc0cb'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function showCelebration() {
    const nextYear = new Date().getFullYear() + 1;
    const nextMothersDay = getNextMothersDay();
    
    // Add celebration message with next year's countdown
    const timerContainer = document.querySelector('.countdown-timer');
    timerContainer.innerHTML = `
        <div class="celebration-message">
            <h2>Happy Mother's Day! 🌸</h2>
            <p>Time to celebrate the amazing mothers in our lives!</p>
            <div class="next-countdown">
                <h3>Next Mother's Day: ${formatDate(nextMothersDay)}</h3>
                <div class="countdown-timer">
                    <div class="countdown-item">
                        <span id="next-days">000</span>
                        <span class="label">Days</span>
                    </div>
                    <div class="countdown-item">
                        <span id="next-hours">00</span>
                        <span class="label">Hours</span>
                    </div>
                    <div class="countdown-item">
                        <span id="next-minutes">00</span>
                        <span class="label">Minutes</span>
                    </div>
                    <div class="countdown-item">
                        <span id="next-seconds">00</span>
                        <span class="label">Seconds</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add celebration styles
    timerContainer.classList.add('celebrating');
    
    // Create confetti effect
    createConfetti();
    
    // Start counting down to next year
    setInterval(() => updateNextYearCountdown(nextMothersDay), 1000);
}

function updateNextYearCountdown(nextMothersDay) {
    const now = new Date();
    const diff = nextMothersDay - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('next-days').textContent = String(days).padStart(3, '0');
    document.getElementById('next-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('next-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('next-seconds').textContent = String(seconds).padStart(2, '0');
}

function updateCountdown() {
    const mothersDay = getNextMothersDay();
    const now = new Date();
    const diff = mothersDay - now;

    // If it's Mother's Day
    if (diff <= 0 && diff > -86400000) { // Within 24 hours of Mother's Day
        showCelebration();
        return; // Stop updating the countdown
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Start the countdown
setInterval(updateCountdown, 1000);
updateCountdown();

// Thank You Note Generator
const thankYouNotes = [
    "Mom, your love is like a warm hug that never ends. Thank you for always being there.",
    "You're not just my mother, you're my first friend, my constant support, and my biggest inspiration.",
    "Thank you for all the late nights, early mornings, and countless sacrifices you've made for me.",
    "Your strength, grace, and endless love make you the amazing mother you are.",
    "Every day I'm grateful for having you as my mom. You make everything better.",
    "Your love has shaped me into who I am today. Thank you for being the best mom ever.",
    "Mom, you're the heart of our family and the light of our lives. Thank you for everything.",
    "Your smile brightens my darkest days. Thank you for being my guiding star.",
];

const generateBtn = document.getElementById('generate-note');
const thankYouNote = document.getElementById('thank-you-note');

generateBtn.addEventListener('click', () => {
    // Add click animation to button
    generateBtn.classList.add('clicked');
    setTimeout(() => generateBtn.classList.remove('clicked'), 600);

    // Fade out current message
    thankYouNote.classList.add('fade-out');
    
    setTimeout(() => {
        // Get new random message
        const randomIndex = Math.floor(Math.random() * thankYouNotes.length);
        thankYouNote.textContent = thankYouNotes[randomIndex];
        
        // Fade in new message
        thankYouNote.classList.remove('fade-out');
        thankYouNote.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            thankYouNote.classList.remove('fade-in');
        }, 500);
    }, 500);
}); 