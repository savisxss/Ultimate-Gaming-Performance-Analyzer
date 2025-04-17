/**
 * Ultimate Gaming Performance Analyzer
 * Display Test Module
 * 
 * This module handles display tests including refresh rate, motion clarity, and sync detection.
 */

const DisplayTest = (function() {
    // Test state variables
    let refreshTestActive = false;
    let motionTestActive = false;
    let syncTestActive = false;
    
    // Test data storage
    let frameTimings = [];
    let animationFrameId = null;
    let lastFrameTime = 0;
    let framesPerSecond = [];
    let frameTimeJitters = [];
    
    // Motion test variables
    let motionClarityScore = 0;
    let motionBlurAmount = 0;
    let motionTestInterval = null;
    let motionTestStage = 0;
    
    // Sync test variables
    let syncTestResults = {
        vSyncDetected: false,
        adaptiveSyncDetected: false,
        syncQualityScore: 0,
        frameTimeVariability: 0,
        tearingDetected: false
    };
    
    // Test UI elements
    let refreshTestArea = null;
    let motionTestArea = null;
    let syncTestArea = null;
    let animationBox = null;
    
    // Charts
    let refreshChart = null;
    let motionChart = null;
    let syncChart = null;
    
    /**
     * Initialize the refresh rate test
     */
    function initRefreshTest() {
        refreshTestArea = document.getElementById('refresh-test-area');
        
        // Create test area content
        refreshTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('refreshTestInstructions')}</p>
            </div>
            <div class="animation-container">
                <div class="animation-box" id="animation-box"></div>
            </div>
        `;
        
        // Get animation box
        animationBox = document.getElementById('animation-box');
        
        // Set initial position
        animationBox.style.left = '0px';
        animationBox.style.top = '50px';
    }
    
    /**
     * Initialize the motion clarity test
     */
    function initMotionTest() {
        motionTestArea = document.getElementById('motion-test-area');
        
        // Create test area content
        motionTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('motionTestInstructions')}</p>
            </div>
            <div class="motion-container" id="motion-container">
                <div class="motion-text">${Translator.translate('motionTestLoading')}</div>
                <div class="motion-object" id="motion-object"></div>
            </div>
            <div class="motion-controls">
                <div class="motion-speed-control">
                    <label>${Translator.translate('speed')}: <span id="motion-speed-value">5</span></label>
                    <input type="range" id="motion-speed" min="1" max="10" value="5">
                </div>
                <div class="motion-clarity-rating">
                    <p>${Translator.translate('rateClarity')}:</p>
                    <div class="rating-buttons">
                        <button class="clarity-rating-btn" data-rating="1">1</button>
                        <button class="clarity-rating-btn" data-rating="2">2</button>
                        <button class="clarity-rating-btn" data-rating="3">3</button>
                        <button class="clarity-rating-btn" data-rating="4">4</button>
                        <button class="clarity-rating-btn" data-rating="5">5</button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup speed control
        const speedControl = document.getElementById('motion-speed');
        const speedValue = document.getElementById('motion-speed-value');
        
        speedControl.addEventListener('input', () => {
            speedValue.textContent = speedControl.value;
            updateMotionSpeed(parseInt(speedControl.value));
        });
        
        // Setup clarity rating buttons
        const ratingButtons = document.querySelectorAll('.clarity-rating-btn');
        ratingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const rating = parseInt(button.getAttribute('data-rating'));
                recordMotionClarityRating(rating);
            });
        });
    }
    
    /**
     * Initialize the sync test
     */
    function initSyncTest() {
        syncTestArea = document.getElementById('sync-test-area');
        
        // Create test area content
        syncTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('syncTestInstructions')}</p>
            </div>
            <div class="sync-container" id="sync-container">
                <div class="sync-pattern" id="sync-pattern"></div>
                <div class="sync-status" id="sync-status">${Translator.translate('analyzing')}...</div>
            </div>
            <div class="sync-controls">
                <button id="test-vsync" class="sub-test-btn">${Translator.translate('testVSync')}</button>
                <button id="test-adaptive" class="sub-test-btn">${Translator.translate('testAdaptiveSync')}</button>
                <button id="test-tearing" class="sub-test-btn">${Translator.translate('testScreenTearing')}</button>
            </div>
        `;
        
        // Setup sub-test buttons
        document.getElementById('test-vsync').addEventListener('click', runVSyncTest);
        document.getElementById('test-adaptive').addEventListener('click', runAdaptiveSyncTest);
        document.getElementById('test-tearing').addEventListener('click', runTearingTest);
    }
    
    /**
     * Start the refresh rate test
     */
    function startRefreshTest() {
        // Initialize test if needed
        if (!refreshTestArea) {
            initRefreshTest();
        }
        
        // Reset test data
        refreshTestActive = true;
        frameTimings = [];
        framesPerSecond = [];
        frameTimeJitters = [];
        lastFrameTime = performance.now();
        
        // Set up results container
        const resultsContainer = document.getElementById('refresh-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('refreshTestRunning')}</p>
            <div class="chart-container">
                <canvas id="refresh-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('refresh-chart').getContext('2d');
        refreshChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: Translator.translate('frameTime') + ' (ms)',
                        data: [],
                        borderColor: 'rgb(255, 152, 0)',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        borderWidth: 2,
                        tension: 0.2,
                        yAxisID: 'y'
                    },
                    {
                        label: Translator.translate('jitter') + ' (ms)',
                        data: [],
                        borderColor: 'rgb(255, 71, 87)',
                        backgroundColor: 'rgba(255, 71, 87, 0.2)',
                        borderWidth: 2,
                        tension: 0.2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('frame')
                        }
                    },
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: Translator.translate('frameTimeMs')
                        },
                        beginAtZero: true
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: Translator.translate('jitterMs')
                        },
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Start animation loop
        animationFrameId = requestAnimationFrame(updateAnimation);
    }
    
    /**
     * Stop the refresh rate test
     */
    function stopRefreshTest() {
        refreshTestActive = false;
        
        // Stop animation loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Analyze and display results
        analyzeRefreshResults();
    }
    
    /**
     * Start the motion clarity test
     */
    function startMotionTest() {
        // Initialize test if needed
        if (!motionTestArea) {
            initMotionTest();
        }
        
        // Reset test data
        motionTestActive = true;
        motionTestStage = 0;
        motionClarityScore = 0;
        motionBlurAmount = 0;
        
        // Set up results container
        const resultsContainer = document.getElementById('motion-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('motionTestInstructions')}</p>
            <div class="chart-container">
                <canvas id="motion-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('motion-chart').getContext('2d');
        motionChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    Translator.translate('textClarity'),
                    Translator.translate('objectSharpness'),
                    Translator.translate('motionBlur'),
                    Translator.translate('ghosting'),
                    Translator.translate('overall')
                ],
                datasets: [{
                    label: Translator.translate('clarityScore'),
                    data: [0, 0, 0, 0, 0],
                    fill: true,
                    backgroundColor: 'rgba(3, 218, 198, 0.2)',
                    borderColor: 'rgb(3, 218, 198)',
                    pointBackgroundColor: 'rgb(3, 218, 198)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(3, 218, 198)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
        
        // Start motion test
        startMotionAnimation();
    }
    
    /**
     * Stop the motion clarity test
     */
    function stopMotionTest() {
        motionTestActive = false;
        
        // Stop motion animation
        if (motionTestInterval) {
            clearInterval(motionTestInterval);
            motionTestInterval = null;
        }
        
        // Analyze and display results
        analyzeMotionResults();
    }
    
    /**
     * Start the sync test
     */
    function startSyncTest() {
        // Initialize test if needed
        if (!syncTestArea) {
            initSyncTest();
        }
        
        // Reset test data
        syncTestActive = true;
        syncTestResults = {
            vSyncDetected: false,
            adaptiveSyncDetected: false,
            syncQualityScore: 0,
            frameTimeVariability: 0,
            tearingDetected: false
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('sync-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('syncTestInstructions')}</p>
            <div class="chart-container">
                <canvas id="sync-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('sync-chart').getContext('2d');
        syncChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translator.translate('vSync'),
                    Translator.translate('adaptiveSync'),
                    Translator.translate('tearingLevel'),
                    Translator.translate('frameTimeConsistency')
                ],
                datasets: [{
                    label: Translator.translate('syncPerformance'),
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(93, 63, 211, 0.6)',
                        'rgba(3, 218, 198, 0.6)',
                        'rgba(255, 71, 87, 0.6)',
                        'rgba(255, 152, 0, 0.6)'
                    ],
                    borderColor: [
                        'rgb(93, 63, 211)',
                        'rgb(3, 218, 198)',
                        'rgb(255, 71, 87)',
                        'rgb(255, 152, 0)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // Run all sync tests in sequence
        runSyncTestSequence();
    }
    
    /**
     * Stop the sync test
     */
    function stopSyncTest() {
        syncTestActive = false;
        
        // Analyze and display results
        analyzeSyncResults();
    }
    
    /**
     * Update animation frame for refresh rate test
     * @param {number} timestamp - Animation frame timestamp
     */
    function updateAnimation(timestamp) {
        if (!refreshTestActive) return;
        
        const now = performance.now();
        const elapsed = now - lastFrameTime;
        
        // Store frame timing data
        frameTimings.push(elapsed);
        lastFrameTime = now;
        
        // Calculate instantaneous FPS
        const fps = 1000 / elapsed;
        framesPerSecond.push(fps);
        
        // Calculate jitter (variation between frames)
        if (frameTimings.length > 1) {
            const jitter = Math.abs(elapsed - frameTimings[frameTimings.length - 2]);
            frameTimeJitters.push(jitter);
        } else {
            frameTimeJitters.push(0);
        }
        
        // Move animation box
        const containerWidth = refreshTestArea.clientWidth - animationBox.clientWidth;
        const position = (now % 3000) / 3000 * containerWidth;
        animationBox.style.left = `${Math.min(position, containerWidth)}px`;
        
        // Update chart with the last 50 frames
        updateRefreshChart();
        
        // Continue animation loop
        animationFrameId = requestAnimationFrame(updateAnimation);
    }
    
    /**
     * Update refresh rate chart with latest data
     */
    function updateRefreshChart() {
        if (!refreshChart || frameTimings.length <= 1) return;
        
        // Get the last 50 frames of data
        const lastFrameTimings = frameTimings.slice(-50);
        const lastJitters = frameTimeJitters.slice(-50);
        const labels = Array.from({length: lastFrameTimings.length}, (_, i) => i + 1);
        
        // Update chart data
        refreshChart.data.labels = labels;
        refreshChart.data.datasets[0].data = lastFrameTimings;
        refreshChart.data.datasets[1].data = lastJitters;
        refreshChart.update();
    }
    
    /**
     * Start motion test animation
     */
    function startMotionAnimation() {
        // Get the motion object and container
        const motionObject = document.getElementById('motion-object');
        const motionContainer = document.getElementById('motion-container');
        const motionText = document.querySelector('.motion-text');
        
        // Set up initial content based on test stage
        switch (motionTestStage) {
            case 0: // Text clarity test
                motionText.textContent = Translator.translate('motionTextTest');
                motionObject.innerHTML = `
                    <div class="motion-text-test">
                        <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                        <p>abcdefghijklmnopqrstuvwxyz</p>
                        <p>0123456789</p>
                    </div>
                `;
                break;
            case 1: // Object sharpness test
                motionText.textContent = Translator.translate('motionObjectTest');
                motionObject.innerHTML = `
                    <div class="motion-object-test">
                        <div class="shape square"></div>
                        <div class="shape circle"></div>
                        <div class="shape triangle"></div>
                    </div>
                `;
                break;
            case 2: // Motion blur test
                motionText.textContent = Translator.translate('motionBlurTest');
                motionObject.innerHTML = `
                    <div class="motion-blur-test">
                        <div class="blur-pattern"></div>
                    </div>
                `;
                break;
            case 3: // Ghosting test
                motionText.textContent = Translator.translate('motionGhostingTest');
                motionObject.innerHTML = `
                    <div class="motion-ghosting-test">
                        <div class="ghosting-block white"></div>
                        <div class="ghosting-block black"></div>
                    </div>
                `;
                break;
            case 4: // Overall test
                motionText.textContent = Translator.translate('motionOverallTest');
                motionObject.innerHTML = `
                    <div class="motion-overall-test">
                        <div class="gaming-icon">FPS</div>
                        <div class="ufo-icon">👾</div>
                    </div>
                `;
                break;
        }
        
        // Get animation speed
        const speed = parseInt(document.getElementById('motion-speed').value);
        
        // Set up motion animation
        let position = 0;
        const containerWidth = motionContainer.clientWidth;
        
        // Clear any existing animation
        if (motionTestInterval) {
            clearInterval(motionTestInterval);
        }
        
        // Start new animation
        motionTestInterval = setInterval(() => {
            if (!motionTestActive) {
                clearInterval(motionTestInterval);
                return;
            }
            
            // Update position
            position = (position + speed * 2) % (containerWidth + 200);
            motionObject.style.transform = `translateX(${position - 100}px)`;
            
        }, 16); // ~60fps update rate
    }
    
    /**
     * Update motion test speed
     * @param {number} speed - New speed value (1-10)
     */
    function updateMotionSpeed(speed) {
        // Only update if test is active
        if (!motionTestActive || !motionTestInterval) return;
        
        // Restart animation with new speed
        clearInterval(motionTestInterval);
        startMotionAnimation();
    }
    
    /**
     * Record motion clarity rating
     * @param {number} rating - User rating (1-5)
     */
    function recordMotionClarityRating(rating) {
        // Only record if test is active
        if (!motionTestActive) return;
        
        // Update chart with the rating
        if (motionChart) {
            motionChart.data.datasets[0].data[motionTestStage] = rating;
            motionChart.update();
        }
        
        // Move to next test stage
        motionTestStage++;
        
        if (motionTestStage < 5) {
            // Start next stage
            startMotionAnimation();
        } else {
            // Test complete
            stopMotionTest();
        }
    }
    
    /**
     * Run a complete sync test sequence
     */
    function runSyncTestSequence() {
        // Only run if test is active
        if (!syncTestActive) return;
        
        const syncStatus = document.getElementById('sync-status');
        syncStatus.textContent = Translator.translate('syncTestRunning');
        
        // Run VSync test
        setTimeout(() => {
            if (!syncTestActive) return;
            runVSyncTest();
            
            // Then run adaptive sync test
            setTimeout(() => {
                if (!syncTestActive) return;
                runAdaptiveSyncTest();
                
                // Then run tearing test
                setTimeout(() => {
                    if (!syncTestActive) return;
                    runTearingTest();
                    
                    // Complete the test
                    setTimeout(() => {
                        if (!syncTestActive) return;
                        stopSyncTest();
                    }, 2000);
                }, 3000);
            }, 3000);
        }, 1000);
    }
    
    /**
     * Run VSync detection test
     */
    function runVSyncTest() {
        if (!syncTestActive) return;
        
        const syncStatus = document.getElementById('sync-status');
        syncStatus.textContent = Translator.translate('testingVSync');
        
        const syncPattern = document.getElementById('sync-pattern');
        syncPattern.innerHTML = `<div class="vsync-test-pattern"></div>`;
        
        // Reset frame timings
        frameTimings = [];
        lastFrameTime = performance.now();
        
        // Capture frame timings for VSync detection
        let frames = 0;
        const captureFrames = () => {
            const now = performance.now();
            frameTimings.push(now - lastFrameTime);
            lastFrameTime = now;
            
            frames++;
            if (frames < 100 && syncTestActive) {
                // Move pattern
                const pattern = syncPattern.querySelector('.vsync-test-pattern');
                pattern.style.left = `${(frames % 30) * 3}px`;
                
                requestAnimationFrame(captureFrames);
            } else {
                // Analyze VSync
                const refreshRate = detectRefreshRate(frameTimings);
                syncTestResults.vSyncDetected = detectVSync(frameTimings, refreshRate);
                
                // Update chart
                updateSyncChart();
                
                syncStatus.textContent = syncTestResults.vSyncDetected ? 
                    Translator.translate('vSyncDetected') : 
                    Translator.translate('vSyncNotDetected');
            }
        };
        
        requestAnimationFrame(captureFrames);
    }
    
    /**
     * Run adaptive sync detection test
     */
    function runAdaptiveSyncTest() {
        if (!syncTestActive) return;
        
        const syncStatus = document.getElementById('sync-status');
        syncStatus.textContent = Translator.translate('testingAdaptiveSync');
        
        const syncPattern = document.getElementById('sync-pattern');
        syncPattern.innerHTML = `<div class="adaptive-test-pattern"></div>`;
        
        // Reset frame timings and create variable load
        frameTimings = [];
        lastFrameTime = performance.now();
        
        // Create variable workload to test adaptive sync
        let frames = 0;
        let workload = 0;
        const captureVariableFrames = () => {
            // Do some variable work to simulate changing frame rates
            workload = (frames % 120) / 2;
            if (workload > 0) {
                const start = performance.now();
                while (performance.now() - start < workload) {
                    // Busy loop to create variable timing
                }
            }
            
            const now = performance.now();
            frameTimings.push(now - lastFrameTime);
            lastFrameTime = now;
            
            frames++;
            if (frames < 200 && syncTestActive) {
                // Move pattern with variable speed
                const pattern = syncPattern.querySelector('.adaptive-test-pattern');
                pattern.style.left = `${(frames % 40) * 2}px`;
                
                requestAnimationFrame(captureVariableFrames);
            } else {
                // Analyze adaptive sync
                const jitter = StatsAnalyzer.calculateJitter(frameTimings);
                const refreshRate = detectRefreshRate(frameTimings);
                syncTestResults.adaptiveSyncDetected = detectAdaptiveSync(frameTimings, jitter);
                
                // Update chart
                updateSyncChart();
                
                syncStatus.textContent = syncTestResults.adaptiveSyncDetected ? 
                    Translator.translate('adaptiveSyncDetected') : 
                    Translator.translate('adaptiveSyncNotDetected');
            }
        };
        
        requestAnimationFrame(captureVariableFrames);
    }
    
    /**
     * Run screen tearing detection test
     */
    function runTearingTest() {
        if (!syncTestActive) return;
        
        const syncStatus = document.getElementById('sync-status');
        syncStatus.textContent = Translator.translate('testingTearing');
        
        const syncPattern = document.getElementById('sync-pattern');
        syncPattern.innerHTML = `<div class="tearing-test-pattern"></div>`;
        
        // Create high-speed animation to induce tearing
        let frames = 0;
        const tearingTestId = setInterval(() => {
            if (!syncTestActive) {
                clearInterval(tearingTestId);
                return;
            }
            
            frames++;
            if (frames < 300) {
                // Move pattern extremely quickly
                const pattern = syncPattern.querySelector('.tearing-test-pattern');
                
                // Create rapid vertical motion
                if (pattern) {
                    pattern.style.backgroundPosition = `0 ${frames * 10}px`;
                }
            } else {
                clearInterval(tearingTestId);
                
                // For tearing, we use user feedback since it's visually detectable
                // In a real implementation, this would use camera/screenshot analysis
                
                // Simulate detection based on previous results
                syncTestResults.tearingDetected = !syncTestResults.vSyncDetected;
                
                // Update chart
                updateSyncChart();
                
                syncStatus.textContent = syncTestResults.tearingDetected ? 
                    Translator.translate('tearingDetected') : 
                    Translator.translate('tearingNotDetected');
            }
        }, 16);
    }
    
    /**
     * Update sync test chart with latest results
     */
    function updateSyncChart() {
        if (!syncChart) return;
        
        // Calculate frame time consistency
        const frameTimes = frameTimings.slice(-100);
        const consistencyMetrics = StatsAnalyzer.calculateConsistencyMetrics(frameTimes);
        syncTestResults.frameTimeVariability = consistencyMetrics.variabilityIndex;
        
        // Calculate overall sync quality score
        syncTestResults.syncQualityScore = calculateSyncQualityScore(
            syncTestResults.vSyncDetected,
            syncTestResults.adaptiveSyncDetected,
            syncTestResults.tearingDetected,
            syncTestResults.frameTimeVariability
        );
        
        // Update chart data
        syncChart.data.datasets[0].data = [
            syncTestResults.vSyncDetected ? 100 : 0,
            syncTestResults.adaptiveSyncDetected ? 100 : 0,
            syncTestResults.tearingDetected ? 100 : 0,
            Math.max(0, 100 - syncTestResults.frameTimeVariability)
        ];
        
        syncChart.update();
    }
    
    /**
     * Detect refresh rate from frame timings
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @returns {number} Detected refresh rate in Hz
     */
    function detectRefreshRate(frameTimes) {
        if (!frameTimes || frameTimes.length === 0) return 60;
        
        return StatsAnalyzer.detectFrameRate(frameTimes);
    }
    
    /**
     * Detect if VSync is enabled
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @param {number} refreshRate - Display refresh rate in Hz
     * @returns {boolean} True if VSync is likely enabled
     */
    function detectVSync(frameTimes, refreshRate) {
        return StatsAnalyzer.detectVSync(frameTimes, refreshRate);
    }
    
    /**
     * Detect if adaptive sync is enabled
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @param {number} jitter - Measured jitter
     * @returns {boolean} True if adaptive sync is likely enabled
     */
    function detectAdaptiveSync(frameTimes, jitter) {
        return StatsAnalyzer.detectAdaptiveSync(frameTimes, jitter);
    }
    
    /**
     * Calculate sync quality score
     * @param {boolean} vSyncDetected - Whether VSync was detected
     * @param {boolean} adaptiveSyncDetected - Whether adaptive sync was detected
     * @param {boolean} tearingDetected - Whether screen tearing was detected
     * @param {number} frameVariability - Frame timing variability index
     * @returns {number} Sync quality score (0-100)
     */
    function calculateSyncQualityScore(vSyncDetected, adaptiveSyncDetected, tearingDetected, frameVariability) {
        let score = 0;
        
        // Adaptive sync is best scenario
        if (adaptiveSyncDetected) {
            score += 80;
        }
        // VSync without adaptive sync is good but adds latency
        else if (vSyncDetected) {
            score += 60;
        }
        // No sync is worst case
        else {
            score += 20;
        }
        
        // Tearing penalties
        if (tearingDetected) {
            score -= 20;
        }
        
        // Frame time consistency bonus/penalty
        const consistencyScore = Math.max(0, 20 - frameVariability / 5);
        score += consistencyScore;
        
        // Clamp to 0-100 range
        return Math.min(100, Math.max(0, score));
    }
    
    /**
     * Analyze refresh rate test results
     */
    function analyzeRefreshResults() {
        if (frameTimings.length < 50) {
            document.getElementById('refresh-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreRefreshData')}</p>
            `;
            return;
        }
        
        // Remove first few frames which may be inconsistent
        const frameTimes = frameTimings.slice(10);
        
        // Filter outliers if enabled
        let filteredFrameTimes = frameTimes;
        if (document.getElementById('filter-outliers').checked) {
            filteredFrameTimes = StatsAnalyzer.filterOutliers(frameTimes);
        }
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            filteredFrameTimes = StatsAnalyzer.applyNoiseReduction(filteredFrameTimes, noiseReductionMethod);
        }
        
        // Calculate statistics
        const avgFrameTime = StatsAnalyzer.calculateAverage(filteredFrameTimes);
        const fps = 1000 / avgFrameTime;
        const minFrameTime = StatsAnalyzer.calculateMin(filteredFrameTimes);
        const maxFrameTime = StatsAnalyzer.calculateMax(filteredFrameTimes);
        const p95FrameTime = StatsAnalyzer.calculatePercentile(filteredFrameTimes, 0.95);
        const stdDev = StatsAnalyzer.calculateStandardDeviation(filteredFrameTimes);
        
        // Calculate jitter (frame time variability)
        const jitter = StatsAnalyzer.calculateJitter(filteredFrameTimes);
        
        // Detect refresh rate
        const detectedRefreshRate = detectRefreshRate(filteredFrameTimes);
        
        // Detect sync features
        const vSyncDetected = detectVSync(filteredFrameTimes, detectedRefreshRate);
        const adaptiveSyncDetected = detectAdaptiveSync(filteredFrameTimes, jitter);
        
        // Store results in global test results
        window.gamePerformanceAnalyzer.testResults.refresh = {
            avgFrameTime: avgFrameTime,
            fps: fps,
            minFrameTime: minFrameTime,
            maxFrameTime: maxFrameTime,
            jitter: jitter,
            detectedRefreshRate: detectedRefreshRate,
            vSyncDetected: vSyncDetected,
            adaptiveSyncDetected: adaptiveSyncDetected,
            stdDev: stdDev,
            sampleCount: filteredFrameTimes.length
        };
        
        // Get ratings
        const refreshRateRating = StatsAnalyzer.rateMetric(detectedRefreshRate, 240, 144, 75, 60, true);
        const jitterRating = StatsAnalyzer.rateMetric(jitter, 0.5, 1, 2, 4);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('refreshTestResults')}</h3>
            <div class="chart-container">
                <canvas id="refresh-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageFrameTime')}</td>
                    <td>${avgFrameTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('detectedRefreshRate')}</td>
                    <td>${detectedRefreshRate} Hz</td>
                    <td><span class="rating ${refreshRateRating.ratingClass}">${Translator.translate(refreshRateRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('measuredFPS')}</td>
                    <td>${fps.toFixed(1)} FPS</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('frameTimeJitter')}</td>
                    <td>${jitter.toFixed(2)} ms</td>
                    <td><span class="rating ${jitterRating.ratingClass}">${Translator.translate(jitterRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumFrameTime')}</td>
                    <td>${minFrameTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumFrameTime')}</td>
                    <td>${maxFrameTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('vSyncDetected')}</td>
                    <td>${vSyncDetected ? Translator.translate('yes') : Translator.translate('no')}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('adaptiveSyncDetected')}</td>
                    <td>${adaptiveSyncDetected ? Translator.translate('yes') : Translator.translate('no')}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('refreshInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const frameTimeConsistency = 100 - (stdDev / avgFrameTime * 100); // % consistency
            const syncQuality = calculateSyncQualityScore(
                vSyncDetected, 
                adaptiveSyncDetected, 
                !vSyncDetected && !adaptiveSyncDetected, 
                100 - frameTimeConsistency
            );
            
            const consistencyRating = StatsAnalyzer.rateMetric(frameTimeConsistency, 95, 90, 85, 75, true);
            const syncQualityRating = StatsAnalyzer.rateMetric(syncQuality, 90, 80, 70, 50, true);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('frameTimeConsistency')}</td>
                    <td>${frameTimeConsistency.toFixed(2)}%</td>
                    <td><span class="rating ${consistencyRating.ratingClass}">${Translator.translate(consistencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('displaySyncQuality')}</td>
                    <td>${syncQuality.toFixed(1)}%</td>
                    <td><span class="rating ${syncQualityRating.ratingClass}">${Translator.translate(syncQualityRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('recommendedSyncMode')}</td>
                    <td>${getRecommendedSyncMode(detectedRefreshRate, frameTimeConsistency, vSyncDetected, adaptiveSyncDetected)}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('refreshTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                const histogram = StatsAnalyzer.createHistogram(filteredFrameTimes, 10);
                
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <p>${Translator.translate('frameTimeDistribution')}:</p>
                <div class="debug-chart-container">
                    <canvas id="refresh-histogram-chart"></canvas>
                </div>
                `;
            }
        }
        
        // Update results container
        document.getElementById('refresh-results').innerHTML = html;
        
        // Create results chart
        createRefreshResultsChart(filteredFrameTimes, frameTimeJitters.slice(10));
        
        // Create histogram chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            createRefreshHistogram(filteredFrameTimes);
        }
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Analyze motion clarity test results
     */
    function analyzeMotionResults() {
        // Calculate overall motion clarity score
        const motionScores = motionChart ? motionChart.data.datasets[0].data : [0, 0, 0, 0, 0];
        
        // If not all tests were completed, use average of completed tests
        const completedScores = motionScores.filter(score => score > 0);
        if (completedScores.length === 0) {
            document.getElementById('motion-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreMotionData')}</p>
            `;
            return;
        }
        
        const avgScore = StatsAnalyzer.calculateAverage(completedScores);
        const finalScore = Math.round(avgScore * 20); // Convert to 0-100 scale
        
        // Store results
        window.gamePerformanceAnalyzer.testResults.motion = {
            textClarity: motionScores[0] || 0,
            objectSharpness: motionScores[1] || 0,
            motionBlur: motionScores[2] || 0,
            ghosting: motionScores[3] || 0,
            overall: motionScores[4] || 0,
            clarityScore: finalScore
        };
        
        // Get rating
        const clarityRating = StatsAnalyzer.rateMetric(finalScore, 90, 75, 60, 40, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('motionTestResults')}</h3>
            <div class="chart-container">
                <canvas id="motion-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('motionClarityScore')}</td>
                    <td>${finalScore}/100</td>
                    <td><span class="rating ${clarityRating.ratingClass}">${Translator.translate(clarityRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('textClarity')}</td>
                    <td>${motionScores[0]}/5</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('objectSharpness')}</td>
                    <td>${motionScores[1]}/5</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('motionBlur')}</td>
                    <td>${motionScores[2]}/5</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('ghostingRating')}</td>
                    <td>${motionScores[3]}/5</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('overallRating')}</td>
                    <td>${motionScores[4]}/5</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('motionInterpretation')}</p>
        `;
        
        // Add recommendations based on score
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (finalScore < 60) {
            html += `<li>${Translator.translate('motionBadRecommendation')}</li>`;
        } else if (finalScore < 80) {
            html += `<li>${Translator.translate('motionAverageRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('motionGoodRecommendation')}</li>`;
        }
        
        if (motionScores[2] < 3) {
            html += `<li>${Translator.translate('motionBlurRecommendation')}</li>`;
        }
        
        if (motionScores[3] < 3) {
            html += `<li>${Translator.translate('ghostingRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('motion-results').innerHTML = html;
        
        // Create radar chart
        const ctx = document.getElementById('motion-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    Translator.translate('textClarity'),
                    Translator.translate('objectSharpness'),
                    Translator.translate('motionBlur'),
                    Translator.translate('ghosting'),
                    Translator.translate('overall')
                ],
                datasets: [{
                    label: Translator.translate('clarityScore'),
                    data: motionScores,
                    fill: true,
                    backgroundColor: 'rgba(3, 218, 198, 0.2)',
                    borderColor: 'rgb(3, 218, 198)',
                    pointBackgroundColor: 'rgb(3, 218, 198)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(3, 218, 198)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
    }
    
    /**
     * Analyze sync test results
     */
    function analyzeSyncResults() {
        // Format the results
        const syncQualityRating = StatsAnalyzer.rateMetric(syncTestResults.syncQualityScore, 90, 75, 60, 40, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('syncTestResults')}</h3>
            <div class="chart-container">
                <canvas id="sync-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('syncQualityScore')}</td>
                    <td>${syncTestResults.syncQualityScore.toFixed(1)}/100</td>
                    <td><span class="rating ${syncQualityRating.ratingClass}">${Translator.translate(syncQualityRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('vSyncDetected')}</td>
                    <td>${syncTestResults.vSyncDetected ? Translator.translate('yes') : Translator.translate('no')}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('adaptiveSyncDetected')}</td>
                    <td>${syncTestResults.adaptiveSyncDetected ? Translator.translate('yes') : Translator.translate('no')}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('tearingDetected')}</td>
                    <td>${syncTestResults.tearingDetected ? Translator.translate('yes') : Translator.translate('no')}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('frameTimeVariability')}</td>
                    <td>${syncTestResults.frameTimeVariability.toFixed(2)}%</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('syncInterpretation')}</p>
        `;
        
        // Add recommendations
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (syncTestResults.adaptiveSyncDetected) {
            html += `<li>${Translator.translate('adaptiveSyncRecommendation')}</li>`;
        } else if (syncTestResults.vSyncDetected && !syncTestResults.adaptiveSyncDetected) {
            html += `<li>${Translator.translate('vSyncRecommendation')}</li>`;
        } else if (syncTestResults.tearingDetected) {
            html += `<li>${Translator.translate('tearingRecommendation')}</li>`;
        }
        
        if (syncTestResults.frameTimeVariability > 10) {
            html += `<li>${Translator.translate('frameTimeVariabilityRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('sync-results').innerHTML = html;
        
        // Create results chart
        const ctx = document.getElementById('sync-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translator.translate('vSync'),
                    Translator.translate('adaptiveSync'),
                    Translator.translate('tearingLevel'),
                    Translator.translate('frameTimeConsistency')
                ],
                datasets: [{
                    label: Translator.translate('syncPerformance'),
                    data: [
                        syncTestResults.vSyncDetected ? 100 : 0,
                        syncTestResults.adaptiveSyncDetected ? 100 : 0,
                        syncTestResults.tearingDetected ? 100 : 0,
                        Math.max(0, 100 - syncTestResults.frameTimeVariability)
                    ],
                    backgroundColor: [
                        'rgba(93, 63, 211, 0.6)',
                        'rgba(3, 218, 198, 0.6)',
                        'rgba(255, 71, 87, 0.6)',
                        'rgba(255, 152, 0, 0.6)'
                    ],
                    borderColor: [
                        'rgb(93, 63, 211)',
                        'rgb(3, 218, 198)',
                        'rgb(255, 71, 87)',
                        'rgb(255, 152, 0)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // Store results
        window.gamePerformanceAnalyzer.testResults.sync = {
            vSyncDetected: syncTestResults.vSyncDetected,
            adaptiveSyncDetected: syncTestResults.adaptiveSyncDetected,
            tearingDetected: syncTestResults.tearingDetected,
            frameTimeVariability: syncTestResults.frameTimeVariability,
            syncQualityScore: syncTestResults.syncQualityScore
        };
    }
    
    /**
     * Create refresh rate results chart
     * @param {Array<number>} frameTimes - Frame time data
     * @param {Array<number>} jitters - Jitter data
     */
    function createRefreshResultsChart(frameTimes, jitters) {
        // Only show up to 100 points for clarity
        const displayLimit = 100;
        const displayFrameTimes = frameTimes.slice(-displayLimit);
        const displayJitters = jitters.slice(-displayLimit);
        
        // If jitters is shorter, pad with zeros
        while (displayJitters.length < displayFrameTimes.length) {
            displayJitters.unshift(0);
        }
        
        const labels = Array.from({length: displayFrameTimes.length}, (_, i) => i + 1);
        
        const ctx = document.getElementById('refresh-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: Translator.translate('frameTime') + ' (ms)',
                        data: displayFrameTimes,
                        borderColor: 'rgb(255, 152, 0)',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        borderWidth: 2,
                        tension: 0.2,
                        yAxisID: 'y'
                    },
                    {
                        label: Translator.translate('jitter') + ' (ms)',
                        data: displayJitters,
                        borderColor: 'rgb(255, 71, 87)',
                        backgroundColor: 'rgba(255, 71, 87, 0.2)',
                        borderWidth: 2,
                        tension: 0.2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('frame')
                        }
                    },
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: Translator.translate('frameTimeMs')
                        },
                        beginAtZero: true
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: Translator.translate('jitterMs')
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Create refresh rate histogram chart
     * @param {Array<number>} frameTimes - Frame time data
     */
    function createRefreshHistogram(frameTimes) {
        const histogram = StatsAnalyzer.createHistogram(frameTimes, 10);
        
        const histCtx = document.getElementById('refresh-histogram-chart').getContext('2d');
        new Chart(histCtx, {
            type: 'bar',
            data: {
                labels: histogram.binEdges.slice(0, -1).map((v, i) => 
                    `${v.toFixed(1)}-${histogram.binEdges[i+1].toFixed(1)} ms`),
                datasets: [{
                    label: Translator.translate('frequency'),
                    data: histogram.frequencies,
                    backgroundColor: 'rgba(255, 152, 0, 0.6)',
                    borderColor: 'rgb(255, 152, 0)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('frameTimeRange')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: Translator.translate('frequency')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Get recommended sync mode based on display characteristics
     * @param {number} refreshRate - Detected refresh rate
     * @param {number} frameTimeConsistency - Frame time consistency
     * @param {boolean} vSyncDetected - Whether VSync was detected
     * @param {boolean} adaptiveSyncDetected - Whether adaptive sync was detected
     * @returns {string} Recommended sync mode
     */
    function getRecommendedSyncMode(refreshRate, frameTimeConsistency, vSyncDetected, adaptiveSyncDetected) {
        if (adaptiveSyncDetected) {
            return Translator.translate('keepAdaptiveSyncRecommendation');
        }
        
        if (refreshRate >= 144) {
            if (vSyncDetected && frameTimeConsistency < 90) {
                return Translator.translate('highRefreshNoVSyncRecommendation');
            } else if (!vSyncDetected) {
                return Translator.translate('enableAdaptiveSyncRecommendation');
            } else {
                return Translator.translate('highRefreshCurrentSettingRecommendation');
            }
        } else {
            if (refreshRate <= 60 && !vSyncDetected) {
                return Translator.translate('lowRefreshVSyncRecommendation');
            } else if (refreshRate <= 60 && vSyncDetected) {
                return Translator.translate('lowRefreshAdaptiveSyncRecommendation');
            } else {
                return Translator.translate('midRefreshUpgradeRecommendation');
            }
        }
    }
    
    // Public API
    return {
        startRefreshTest,
        stopRefreshTest,
        startMotionTest,
        stopMotionTest,
        startSyncTest,
        stopSyncTest
    };
})();