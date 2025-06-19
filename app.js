class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.startTime = null;
        this.timerInterval = null;
        this.isTimerRunning = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.startTimer();
        this.initializeInteractiveElements();
    }

    initializeElements() {
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.timerDisplay = document.getElementById('timer');
        
        // Set total slides
        this.totalSlidesSpan.textContent = this.totalSlides;
    }

    bindEvents() {
        // Navigation button events
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mouse wheel events for slide navigation
        document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Touch events for mobile
        this.bindTouchEvents();
        
        // Window focus events for timer
        window.addEventListener('focus', () => this.resumeTimer());
        window.addEventListener('blur', () => this.pauseTimer());
    }

    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if horizontal swipe is longer than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        }
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.resetTimer();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.toggleTimer();
                break;
            case 'Escape':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }

    handleWheel(e) {
        // Throttle wheel events
        if (this.wheelTimeout) return;
        
        this.wheelTimeout = setTimeout(() => {
            this.wheelTimeout = null;
        }, 300);

        if (e.deltaY > 0) {
            this.nextSlide();
        } else if (e.deltaY < 0) {
            this.previousSlide();
        }
        
        e.preventDefault();
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        // Remove active class from current slide
        this.slides[this.currentSlide - 1].classList.remove('active');
        
        // Update current slide
        this.currentSlide = slideNumber;
        
        // Add active class to new slide
        this.slides[this.currentSlide - 1].classList.add('active');
        
        // Update UI
        this.updateSlideCounter();
        this.updateNavigationButtons();
        
        // Trigger slide-specific animations
        this.triggerSlideAnimations();
        
        // Auto-advance timer milestone
        this.updateTimerMilestone();
    }

    updateSlideCounter() {
        this.currentSlideSpan.textContent = this.currentSlide;
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
    }

    triggerSlideAnimations() {
        const currentSlideElement = this.slides[this.currentSlide - 1];
        
        // Reset all animations first
        this.resetSlideAnimations(currentSlideElement);
        
        // Trigger bullet point animations
        setTimeout(() => {
            this.animateBulletPoints(currentSlideElement);
        }, 100);
        
        // Trigger other slide-specific animations
        setTimeout(() => {
            this.animateSlideContent(currentSlideElement);
        }, 200);
    }

    resetSlideAnimations(slideElement) {
        // Reset bullet points
        const bulletItems = slideElement.querySelectorAll('.bullet-item');
        bulletItems.forEach(item => {
            item.classList.remove('animated');
        });

        // Reset other animated elements
        const animatedElements = slideElement.querySelectorAll('[data-delay]');
        animatedElements.forEach(element => {
            element.style.animationDelay = '0s';
            element.style.animation = 'none';
            // Force reflow
            element.offsetHeight;
        });
    }

    animateBulletPoints(slideElement) {
        const bulletItems = slideElement.querySelectorAll('.bullet-item');
        bulletItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animated');
            }, index * 200);
        });
    }

    animateSlideContent(slideElement) {
        const elementsWithDelay = slideElement.querySelectorAll('[data-delay]');
        
        elementsWithDelay.forEach(element => {
            const delay = parseInt(element.getAttribute('data-delay')) || 0;
            
            setTimeout(() => {
                // Trigger the animation based on the element type
                if (element.classList.contains('typing-text')) {
                    this.startTypingAnimation(element);
                } else if (element.classList.contains('pdf-page')) {
                    element.style.animation = 'fallDown 0.5s ease-out forwards';
                } else if (element.classList.contains('animated-arrow')) {
                    element.style.animation = 'slideIn 0.5s ease-out forwards';
                } else if (element.classList.contains('page-result')) {
                    element.style.animation = 'pageAppear 0.3s ease-out forwards';
                } else if (element.classList.contains('vector-representation')) {
                    element.style.animation = 'matrixEffect 1s ease-out forwards';
                } else if (element.classList.contains('cluster')) {
                    element.style.animation = 'clusterAppear 0.8s ease-out forwards';
                } else if (element.classList.contains('search-line')) {
                    element.style.animation = 'drawLine 0.5s ease-out forwards';
                } else if (element.classList.contains('doc-vector')) {
                    element.style.animation = 'docAppear 0.3s ease-out forwards';
                } else if (element.classList.contains('table-row')) {
                    element.style.animation = 'rowAppear 0.5s ease-out forwards';
                } else if (element.classList.contains('query-drop')) {
                    element.style.animation = 'dropQuery 1s ease-out forwards';
                } else if (element.classList.contains('flow-step')) {
                    element.style.animation = 'flowStepAppear 0.6s ease-out forwards';
                } else if (element.classList.contains('flow-arrow')) {
                    element.style.animation = 'fadeIn 0.5s ease-out forwards';
                } else if (element.classList.contains('hyde-step')) {
                    element.style.animation = 'hydeStepAppear 0.6s ease-out forwards';
                } else if (element.classList.contains('hyde-arrow')) {
                    element.style.animation = 'fadeIn 0.5s ease-out forwards';
                } else if (element.classList.contains('doc-layer')) {
                    element.style.animation = 'layerAppear 0.3s ease-out forwards';
                } else if (element.classList.contains('selected-doc')) {
                    element.style.animation = 'selectDoc 0.5s ease-out forwards';
                } else if (element.classList.contains('workflow-step')) {
                    element.style.animation = 'workflowStepAppear 0.5s ease-out forwards';
                } else if (element.classList.contains('benefit-card')) {
                    element.style.animation = 'cardAppear 0.6s ease-out forwards';
                } else if (element.classList.contains('key-message')) {
                    element.style.animation = 'messageAppear 0.8s ease-out forwards';
                } else if (element.classList.contains('closing-animation')) {
                    element.style.animation = 'fadeIn 0.8s ease-out forwards';
                } else if (element.classList.contains('questions-section')) {
                    element.style.animation = 'fadeIn 0.8s ease-out forwards';
                } else {
                    // Generic fade in animation
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    element.style.transition = 'all 0.5s ease-out';
                    element.offsetHeight; // Force reflow
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }, delay);
        });
    }

    startTypingAnimation(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    initializeInteractiveElements() {
        // Initialize chunking slider
        this.initializeChunkingSlider();
        
        // Initialize concept dot hover effects
        this.initializeConceptDots();
        
        // Initialize benefit card hover effects
        this.initializeBenefitCards();
        
        // Initialize other interactive elements
        this.initializeSearchDemo();
    }

    initializeChunkingSlider() {
        const slider = document.getElementById('chunkSlider');
        if (!slider) return;

        const display = document.querySelector('.chunk-size-display');
        const labels = { '1': 'Small', '2': 'Medium', '3': 'Large' };

        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            const chunks = document.querySelectorAll('.chunk');

            chunks.forEach(chunk => {
                chunk.style.display = 'none';
            });

            const targetChunks = document.querySelectorAll(`[data-size="${value}"]`);
            targetChunks.forEach(chunk => {
                chunk.style.display = 'inline-block';
            });

            if (display) {
                display.textContent = `${labels[value]} chunks`;
            }
        });

        // Initialize with medium chunks
        slider.dispatchEvent(new Event('input'));
    }

    initializeConceptDots() {
        const conceptDots = document.querySelectorAll('.concept-dot[data-hover]');
        
        conceptDots.forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                const hoverText = dot.getAttribute('data-hover');
                this.showTooltip(dot, `Concept: ${hoverText}`);
            });

            dot.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            dot.addEventListener('click', () => {
                this.highlightRelatedConcepts(dot);
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'concept-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--color-text);
            color: var(--color-surface);
            padding: var(--space-8) var(--space-12);
            border-radius: var(--radius-base);
            font-size: var(--font-size-sm);
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    highlightRelatedConcepts(clickedDot) {
        const allDots = document.querySelectorAll('.concept-dot');
        const cluster = clickedDot.closest('.cluster');
        
        // Reset all dots
        allDots.forEach(dot => {
            dot.style.transform = 'scale(1)';
            dot.style.opacity = '0.5';
        });

        // Highlight cluster
        if (cluster) {
            const clusterDots = cluster.querySelectorAll('.concept-dot');
            clusterDots.forEach(dot => {
                dot.style.transform = 'scale(1.2)';
                dot.style.opacity = '1';
            });
        }

        // Reset after 2 seconds
        setTimeout(() => {
            allDots.forEach(dot => {
                dot.style.transform = 'scale(1)';
                dot.style.opacity = '1';
            });
        }, 2000);
    }

    initializeBenefitCards() {
        const benefitCards = document.querySelectorAll('.benefit-card');
        
        benefitCards.forEach(card => {
            card.addEventListener('click', () => {
                // Add a special click effect
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            });
        });
    }

    initializeSearchDemo() {
        // Add interactive search visualization
        const queryDot = document.querySelector('.query-dot');
        const docVectors = document.querySelectorAll('.doc-vector');
        
        if (queryDot) {
            queryDot.addEventListener('click', () => {
                this.demonstrateSearch();
            });
        }
    }

    demonstrateSearch() {
        const searchLines = document.querySelectorAll('.search-line');
        const docVectors = document.querySelectorAll('.doc-vector');
        
        // Animate search lines
        searchLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.animation = 'drawLine 0.5s ease-out forwards';
            }, index * 200);
        });

        // Highlight documents in order of relevance
        docVectors.forEach((doc, index) => {
            setTimeout(() => {
                doc.style.background = 'var(--color-success)';
                doc.style.color = 'white';
                doc.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    doc.style.background = 'var(--color-surface)';
                    doc.style.color = 'var(--color-text)';
                    doc.style.transform = 'scale(1)';
                }, 1000);
            }, 1500 + index * 300);
        });
    }

    startTimer() {
        if (this.isTimerRunning) return;
        
        this.startTime = Date.now();
        this.isTimerRunning = true;
        
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
    }

    pauseTimer() {
        if (!this.isTimerRunning) return;
        
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
    }

    resumeTimer() {
        if (this.isTimerRunning) return;
        
        this.startTimer();
    }

    resetTimer() {
        this.pauseTimer();
        this.startTime = Date.now();
        this.updateTimerDisplay();
        this.startTimer();
    }

    toggleTimer() {
        if (this.isTimerRunning) {
            this.pauseTimer();
        } else {
            this.resumeTimer();
        }
    }

    updateTimerDisplay() {
        if (!this.startTime) return;
        
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = formattedTime;
        
        // Change timer color based on time
        if (minutes >= 15) {
            this.timerDisplay.style.color = 'var(--color-error)';
        } else if (minutes >= 12) {
            this.timerDisplay.style.color = 'var(--color-warning)';
        } else {
            this.timerDisplay.style.color = 'var(--color-primary)';
        }
    }

    updateTimerMilestone() {
        // Expected time per slide (15 minutes / 15 slides = 1 minute per slide)
        const expectedMinutes = this.currentSlide;
        const elapsed = Date.now() - this.startTime;
        const actualMinutes = elapsed / 60000;
        
        // Visual feedback for pacing
        if (actualMinutes > expectedMinutes + 1) {
            // Running behind
            this.timerDisplay.classList.add('timer-behind');
            this.timerDisplay.classList.remove('timer-ahead');
        } else if (actualMinutes < expectedMinutes - 1) {
            // Running ahead
            this.timerDisplay.classList.add('timer-ahead');
            this.timerDisplay.classList.remove('timer-behind');
        } else {
            // On track
            this.timerDisplay.classList.remove('timer-behind', 'timer-ahead');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Utility methods for enhanced interactivity
    createParticleEffect(element) {
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--color-primary);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;
            
            const rect = element.getBoundingClientRect();
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            // Animate particle
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 100 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    // Interactive sentence embedding demo
    createEmbeddingDemo() {
        const demoContainer = document.createElement('div');
        demoContainer.innerHTML = `
            <div class="embedding-demo">
                <h3>Try It: Sentence Embedding</h3>
                <input type="text" placeholder="Enter a sentence..." class="sentence-input">
                <button class="embed-btn">Embed Sentence</button>
                <div class="embedding-result"></div>
            </div>
        `;
        
        const input = demoContainer.querySelector('.sentence-input');
        const button = demoContainer.querySelector('.embed-btn');
        const result = demoContainer.querySelector('.embedding-result');
        
        button.addEventListener('click', () => {
            const sentence = input.value.trim();
            if (sentence) {
                this.simulateEmbedding(sentence, result);
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                button.click();
            }
        });
        
        return demoContainer;
    }

    simulateEmbedding(sentence, resultElement) {
        // Simulate embedding generation
        resultElement.innerHTML = '<div class="loading">Generating embedding...</div>';
        
        setTimeout(() => {
            const fakeEmbedding = this.generateFakeEmbedding(sentence);
            resultElement.innerHTML = `
                <div class="embedding-output">
                    <div class="sentence">"${sentence}"</div>
                    <div class="vector">[${fakeEmbedding.join(', ')}]</div>
                    <div class="similarity">Similarity to "dog": ${this.calculateFakeSimilarity(sentence, 'dog')}%</div>
                </div>
            `;
        }, 1000);
    }

    generateFakeEmbedding(sentence) {
        // Generate a fake but consistent embedding based on sentence content
        const words = sentence.toLowerCase().split(' ');
        const embedding = [];
        
        for (let i = 0; i < 8; i++) {
            let value = 0;
            words.forEach(word => {
                value += (word.charCodeAt(0) || 0) * (i + 1);
            });
            embedding.push((Math.sin(value) * 0.5).toFixed(3));
        }
        
        return embedding;
    }

    calculateFakeSimilarity(sentence1, sentence2) {
        const words1 = sentence1.toLowerCase().split(' ');
        const words2 = sentence2.toLowerCase().split(' ');
        
        let similarity = 0;
        if (words1.some(word => word.includes('dog') || word.includes('pet') || word.includes('animal'))) {
            similarity = 85 + Math.random() * 10;
        } else if (words1.some(word => word.includes('cat') || word.includes('bird'))) {
            similarity = 70 + Math.random() * 15;
        } else {
            similarity = Math.random() * 30;
        }
        
        return Math.round(similarity);
    }

    // RAG Playground simulation
    createRAGPlayground() {
        const playground = document.createElement('div');
        playground.innerHTML = `
            <div class="rag-playground">
                <h3>RAG Playground</h3>
                <div class="query-section">
                    <input type="text" placeholder="Ask about company policies..." class="rag-query">
                    <button class="rag-submit">Ask RAG System</button>
                </div>
                <div class="rag-process">
                    <div class="process-step" data-step="1">
                        <div class="step-title">1. Embed Query</div>
                        <div class="step-content"></div>
                    </div>
                    <div class="process-step" data-step="2">
                        <div class="step-title">2. Search Documents</div>
                        <div class="step-content"></div>
                    </div>
                    <div class="process-step" data-step="3">
                        <div class="step-title">3. Generate Answer</div>
                        <div class="step-content"></div>
                    </div>
                </div>
                <div class="rag-answer"></div>
            </div>
        `;
        
        const queryInput = playground.querySelector('.rag-query');
        const submitBtn = playground.querySelector('.rag-submit');
        const answerDiv = playground.querySelector('.rag-answer');
        
        submitBtn.addEventListener('click', () => {
            const query = queryInput.value.trim();
            if (query) {
                this.simulateRAGProcess(query, playground, answerDiv);
            }
        });
        
        return playground;
    }

    simulateRAGProcess(query, playground, answerDiv) {
        const steps = playground.querySelectorAll('.process-step');
        
        // Step 1: Embed Query
        setTimeout(() => {
            const step1 = steps[0].querySelector('.step-content');
            step1.innerHTML = `<div class="vector-display">[0.2, 0.7, -0.1, ...]</div>`;
            steps[0].classList.add('active');
        }, 500);
        
        // Step 2: Search Documents
        setTimeout(() => {
            const step2 = steps[1].querySelector('.step-content');
            step2.innerHTML = `
                <div class="retrieved-docs">
                    <div class="doc-match">📄 Vacation Policy (95% match)</div>
                    <div class="doc-match">📄 HR Handbook (87% match)</div>
                    <div class="doc-match">📄 Benefits Guide (82% match)</div>
                </div>
            `;
            steps[1].classList.add('active');
        }, 1500);
        
        // Step 3: Generate Answer
        setTimeout(() => {
            const step3 = steps[2].querySelector('.step-content');
            step3.innerHTML = `<div class="generation-status">Generating response...</div>`;
            steps[2].classList.add('active');
        }, 2500);
        
        // Final Answer
        setTimeout(() => {
            answerDiv.innerHTML = `
                <div class="final-answer">
                    <h4>RAG Answer:</h4>
                    <p>Based on your company's vacation policy document, full-time employees are entitled to 25 days of paid time off per year. This includes vacation days, personal days, and sick leave.</p>
                    <div class="sources">
                        <strong>Sources:</strong> Vacation Policy Document (Section 3.1)
                    </div>
                </div>
            `;
        }, 3500);
    }
}

// Enhanced hover effects
function addEnhancedHoverEffects() {
    const interactiveElements = document.querySelectorAll('.concept-dot, .benefit-card, .workflow-step, .chunk');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            if (this.classList.contains('concept-dot')) {
                this.style.transform = 'scale(1.2) translateY(-5px)';
                this.style.boxShadow = '0 8px 25px rgba(33, 128, 141, 0.3)';
            } else {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = 'var(--shadow-lg)';
            }
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// Enhanced click effects with particle animations
function addEnhancedClickEffects() {
    const clickableElements = document.querySelectorAll('button, .concept-dot, .benefit-card');
    
    clickableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(33, 128, 141, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Progress indicator
function addProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--color-secondary);
        z-index: 1000;
    `;
    progressBar.firstElementChild.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary), var(--color-success));
        width: ${(1 / 15) * 100}%;
        transition: width 0.5s var(--ease-standard);
        box-shadow: 0 0 10px rgba(33, 128, 141, 0.5);
    `;
    document.body.appendChild(progressBar);
    
    return progressBar;
}

// Keyboard shortcuts help
function showKeyboardShortcuts() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="shortcuts-modal">
            <div class="modal-content">
                <h3>🎯 Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
                    <div class="shortcut">
                        <kbd>→</kbd> <kbd>Space</kbd> <span>Next slide</span>
                    </div>
                    <div class="shortcut">
                        <kbd>←</kbd> <span>Previous slide</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Home</kbd> <span>First slide</span>
                    </div>
                    <div class="shortcut">
                        <kbd>End</kbd> <span>Last slide</span>
                    </div>
                    <div class="shortcut">
                        <kbd>R</kbd> <span>Reset timer</span>
                    </div>
                    <div class="shortcut">
                        <kbd>P</kbd> <span>Pause/Resume timer</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Esc</kbd> <span>Toggle fullscreen</span>
                    </div>
                </div>
                <button class="close-modal">Got it! 🚀</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modalFadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--color-surface);
        padding: var(--space-32);
        border-radius: var(--radius-lg);
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: var(--shadow-lg);
    `;
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'modalFadeOut 0.3s ease-out forwards';
        setTimeout(() => modal.remove(), 300);
    });
    
    document.body.appendChild(modal);
    
    // Auto-close after 8 seconds
    setTimeout(() => {
        if (modal.parentElement) {
            closeBtn.click();
        }
    }, 8000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes modalFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        .shortcuts-grid {
            display: grid;
            gap: var(--space-12);
            margin: var(--space-24) 0;
            text-align: left;
        }
        
        .shortcut {
            display: flex;
            align-items: center;
            gap: var(--space-12);
        }
        
        kbd {
            background: var(--color-secondary);
            padding: var(--space-4) var(--space-8);
            border-radius: var(--radius-sm);
            font-family: var(--font-family-mono);
            font-size: var(--font-size-sm);
            border: 1px solid var(--color-border);
        }
        
        .close-modal {
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            border: none;
            padding: var(--space-12) var(--space-24);
            border-radius: var(--radius-base);
            font-size: var(--font-size-md);
            font-weight: var(--font-weight-medium);
            cursor: pointer;
            transition: all var(--duration-fast) var(--ease-standard);
        }
        
        .close-modal:hover {
            background: var(--color-primary-hover);
            transform: translateY(-2px);
        }
        
        .timer-behind {
            animation: pulse-red 2s infinite;
        }
        
        .timer-ahead {
            animation: pulse-green 2s infinite;
        }
        
        @keyframes pulse-red {
            0%, 100% { color: var(--color-error); }
            50% { color: var(--color-error); opacity: 0.7; }
        }
        
        @keyframes pulse-green {
            0%, 100% { color: var(--color-success); }
            50% { color: var(--color-success); opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the presentation controller
    window.presentation = new PresentationController();
    
    // Add enhanced interactions
    addEnhancedHoverEffects();
    addEnhancedClickEffects();
    
    // Add progress indicator
    const progressBar = addProgressIndicator();
    
    // Update progress bar when slides change
    const originalGoToSlide = window.presentation.goToSlide;
    window.presentation.goToSlide = function(slideNumber) {
        originalGoToSlide.call(this, slideNumber);
        const progressFill = progressBar.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(slideNumber / 15) * 100}%`;
        }
    };
    
    // Show keyboard shortcuts after a delay
    setTimeout(showKeyboardShortcuts, 2000);
    
    // Add welcome message
    setTimeout(() => {
        console.log(`
🎯 RAG Presentation Controls:
→ Use arrow keys or space to navigate
→ Click on interactive elements to explore
→ Hover over concept dots for details
→ Try the chunking slider on slide 9
→ Press 'R' to reset timer, 'P' to pause
→ Press 'Esc' for fullscreen mode

Enjoy the presentation! 🚀
        `);
    }, 1000);
});

// Export for potential external use
window.PresentationController = PresentationController;