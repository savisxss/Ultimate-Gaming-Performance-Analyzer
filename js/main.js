/**
 * Ultimate Gaming Performance Analyzer
 * Main JavaScript file
 * 
 * This file contains the core functionality and application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let activeTests = {
        mouse: false,
        keyboard: false,
        display: false,
        system: false,
        gpu: false,
        audio: false
    };

    // Test results storage
    const testResults = {
        mouse: null,
        keyboard: null,
        display: null,
        system: null,
        gpu: null,
        audio: null,
        // Store all the component tests
        click: null,
        refresh: null,
        motion: null,
        sync: null,
        cpu: null,
        memory: null,
        rendering: null,
        shader: null,
        texture: null,
        audioLatency: null,
        audioQuality: null
    };

    // Initialize the application
    initApp();

    /**
     * Initialize the application
     */
    function initApp() {
        // Set the correct language based on browser settings
        initializeLanguage();
        
        // Check browser compatibility and display warnings if needed
        checkEnvironment();
        
        // Collect system information
        collectSystemInfo();
        
        // Initialize tab navigation
        initTabs();
        
        // Setup fullscreen toggle
        setupFullscreenToggle();
        
        // Initialize settings
        initSettings();
        
        // Initialize test buttons
        initTestButtons();
        
        // Set up quick test button
        document.getElementById('quick-test-btn').addEventListener('click', runQuickTest);
        
        // Set up results export button
        document.getElementById('export-results').addEventListener('click', exportResults);
        
        // Set up results share button
        document.getElementById('share-results').addEventListener('click', shareResults);
        
        // Set up settings reset button
        document.getElementById('reset-settings').addEventListener('click', resetSettings);
        
        // Log initialization complete
        console.log('Gaming Performance Analyzer initialized successfully');
    }

    /**
     * Initialize tab navigation
     */
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and content
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const contentId = tab.getAttribute('data-tab');
                document.getElementById(contentId).classList.add('active');
            });
        });
    }

    /**
     * Initialize test buttons
     */
    function initTestButtons() {
        // Mouse test buttons
        document.getElementById('start-mouse-test').addEventListener('click', () => {
            startTest('mouse');
        });
        document.getElementById('stop-mouse-test').addEventListener('click', () => {
            stopTest('mouse');
        });
        
        // Click test buttons
        document.getElementById('start-click-test').addEventListener('click', () => {
            startTest('click');
        });
        document.getElementById('stop-click-test').addEventListener('click', () => {
            stopTest('click');
        });
        
        // Keyboard test buttons
        document.getElementById('start-keyboard-test').addEventListener('click', () => {
            startTest('keyboard');
        });
        document.getElementById('stop-keyboard-test').addEventListener('click', () => {
            stopTest('keyboard');
        });
        
        // Refresh rate test buttons
        document.getElementById('start-refresh-test').addEventListener('click', () => {
            startTest('refresh');
        });
        document.getElementById('stop-refresh-test').addEventListener('click', () => {
            stopTest('refresh');
        });
        
        // Motion clarity test buttons
        document.getElementById('start-motion-test').addEventListener('click', () => {
            startTest('motion');
        });
        document.getElementById('stop-motion-test').addEventListener('click', () => {
            stopTest('motion');
        });
        
        // VSync test buttons
        document.getElementById('start-sync-test').addEventListener('click', () => {
            startTest('sync');
        });
        document.getElementById('stop-sync-test').addEventListener('click', () => {
            stopTest('sync');
        });
        
        // System test buttons
        document.getElementById('start-system-test').addEventListener('click', () => {
            startTest('system');
        });
        document.getElementById('stop-system-test').addEventListener('click', () => {
            stopTest('system');
        });
        
        // CPU test buttons
        document.getElementById('start-cpu-test').addEventListener('click', () => {
            startTest('cpu');
        });
        document.getElementById('stop-cpu-test').addEventListener('click', () => {
            stopTest('cpu');
        });
        
        // Memory test buttons
        document.getElementById('start-memory-test').addEventListener('click', () => {
            startTest('memory');
        });
        document.getElementById('stop-memory-test').addEventListener('click', () => {
            stopTest('memory');
        });
        
        // GPU rendering test buttons
        document.getElementById('start-rendering-test').addEventListener('click', () => {
            startTest('rendering');
        });
        document.getElementById('stop-rendering-test').addEventListener('click', () => {
            stopTest('rendering');
        });
        
        // Shader test buttons
        document.getElementById('start-shader-test').addEventListener('click', () => {
            startTest('shader');
        });
        document.getElementById('stop-shader-test').addEventListener('click', () => {
            stopTest('shader');
        });
        
        // Texture test buttons
        document.getElementById('start-texture-test').addEventListener('click', () => {
            startTest('texture');
        });
        document.getElementById('stop-texture-test').addEventListener('click', () => {
            stopTest('texture');
        });
        
        // Audio latency test buttons
        document.getElementById('start-audio-latency-test').addEventListener('click', () => {
            startTest('audioLatency');
        });
        document.getElementById('stop-audio-latency-test').addEventListener('click', () => {
            stopTest('audioLatency');
        });
        
        // Audio quality test buttons
        document.getElementById('start-audio-quality-test').addEventListener('click', () => {
            startTest('audioQuality');
        });
        document.getElementById('stop-audio-quality-test').addEventListener('click', () => {
            stopTest('audioQuality');
        });
    }

    /**
     * Start a specific test
     * @param {string} testName - The name of the test to start
     */
    function startTest(testName) {
        // Disable the start button and enable the stop button
        document.getElementById(`start-${testName}-test`).disabled = true;
        document.getElementById(`stop-${testName}-test`).disabled = false;

        // Mark the test as active
        if (testName === 'mouse' || testName === 'click') {
            activeTests.mouse = true;
        } else if (testName === 'keyboard') {
            activeTests.keyboard = true;
        } else if (testName === 'refresh' || testName === 'motion' || testName === 'sync') {
            activeTests.display = true;
        } else if (testName === 'system' || testName === 'cpu' || testName === 'memory') {
            activeTests.system = true;
        } else if (testName === 'rendering' || testName === 'shader' || testName === 'texture') {
            activeTests.gpu = true;
        } else if (testName === 'audioLatency' || testName === 'audioQuality') {
            activeTests.audio = true;
        }

        // Show the results container and initialize it with a loading message
        const resultsContainer = document.getElementById(`${testName}-results`);
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${getTranslation('testInProgress')}</h3>
            <p>${getTranslation('pleaseWait')}</p>
            <div class="spinner"></div>
        `;

        try {
            // Call the appropriate test function from imported modules
            switch (testName) {
                case 'mouse':
                    MouseTest.startMouseTest();
                    break;
                case 'click':
                    MouseTest.startClickTest();
                    break;
                case 'keyboard':
                    KeyboardTest.startKeyboardTest();
                    break;
                case 'refresh':
                    DisplayTest.startRefreshTest();
                    break;
                case 'motion':
                    DisplayTest.startMotionTest();
                    break;
                case 'sync':
                    DisplayTest.startSyncTest();
                    break;
                case 'system':
                    SystemTest.startSystemTest();
                    break;
                case 'cpu':
                    SystemTest.startCpuTest();
                    break;
                case 'memory':
                    SystemTest.startMemoryTest();
                    break;
                case 'rendering':
                    GpuTest.startRenderingTest();
                    break;
                case 'shader':
                    GpuTest.startShaderTest();
                    break;
                case 'texture':
                    GpuTest.startTextureTest();
                    break;
                case 'audioLatency':
                    AudioTest.startLatencyTest();
                    break;
                case 'audioQuality':
                    AudioTest.startQualityTest();
                    break;
                default:
                    console.error(`Unknown test: ${testName}`);
                    stopTest(testName);
                    return;
            }
        } catch (error) {
            console.error(`Error starting ${testName} test:`, error);
            resultsContainer.innerHTML = `
                <h3>${getTranslation('testError')}</h3>
                <p>${getTranslation('errorOccurred')}: ${error.message}</p>
            `;
            stopTest(testName);
        }
    }

    /**
     * Stop a specific test
     * @param {string} testName - The name of the test to stop
     */
    function stopTest(testName) {
        // Enable the start button and disable the stop button
        document.getElementById(`start-${testName}-test`).disabled = false;
        document.getElementById(`stop-${testName}-test`).disabled = true;

        // Mark the test as inactive
        if (testName === 'mouse' || testName === 'click') {
            activeTests.mouse = false;
        } else if (testName === 'keyboard') {
            activeTests.keyboard = false;
        } else if (testName === 'refresh' || testName === 'motion' || testName === 'sync') {
            activeTests.display = false;
        } else if (testName === 'system' || testName === 'cpu' || testName === 'memory') {
            activeTests.system = false;
        } else if (testName === 'rendering' || testName === 'shader' || testName === 'texture') {
            activeTests.gpu = false;
        } else if (testName === 'audioLatency' || testName === 'audioQuality') {
            activeTests.audio = false;
        }

        try {
            // Call the appropriate stop function from imported modules
            switch (testName) {
                case 'mouse':
                    MouseTest.stopMouseTest();
                    break;
                case 'click':
                    MouseTest.stopClickTest();
                    break;
                case 'keyboard':
                    KeyboardTest.stopKeyboardTest();
                    break;
                case 'refresh':
                    DisplayTest.stopRefreshTest();
                    break;
                case 'motion':
                    DisplayTest.stopMotionTest();
                    break;
                case 'sync':
                    DisplayTest.stopSyncTest();
                    break;
                case 'system':
                    SystemTest.stopSystemTest();
                    break;
                case 'cpu':
                    SystemTest.stopCpuTest();
                    break;
                case 'memory':
                    SystemTest.stopMemoryTest();
                    break;
                case 'rendering':
                    GpuTest.stopRenderingTest();
                    break;
                case 'shader':
                    GpuTest.stopShaderTest();
                    break;
                case 'texture':
                    GpuTest.stopTextureTest();
                    break;
                case 'audioLatency':
                    AudioTest.stopLatencyTest();
                    break;
                case 'audioQuality':
                    AudioTest.stopQualityTest();
                    break;
            }
        } catch (error) {
            console.error(`Error stopping ${testName} test:`, error);
        }

        // Check if there are enough tests completed to generate an overall score
        checkAllTestsCompleted();
    }

    /**
     * Run a quick test suite that runs all tests in sequence
     */
    function runQuickTest() {
        // Activate the appropriate tab
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        const firstTab = document.querySelector('.tab[data-tab="input-tests"]');
        firstTab.classList.add('active');
        
        // Show the input tests content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById('input-tests').classList.add('active');
        
        // Set up the test sequence
        const testSequence = [
            'mouse',
            'click',
            'keyboard',
            'refresh',
            'system',
            'rendering',
            'audioLatency'
        ];
        
        let currentTestIndex = 0;
        
        // Function to run the next test in sequence
        function runNextTest() {
            if (currentTestIndex >= testSequence.length) {
                // All tests complete, show results
                showResults();
                return;
            }
            
            const testName = testSequence[currentTestIndex];
            currentTestIndex++;
            
            // Scroll to the test section
            const testSection = document.getElementById(`${testName}-test-area`).closest('.test-section');
            testSection.scrollIntoView({ behavior: 'smooth' });
            
            // Start the test
            setTimeout(() => {
                startTest(testName);
                
                // Set a timeout for each test (these need to be reasonable times for each test)
                const testDurations = {
                    'mouse': 10000,      // 10 seconds
                    'click': 20000,      // 20 seconds (time for user interactions)
                    'keyboard': 15000,   // 15 seconds
                    'refresh': 8000,     // 8 seconds
                    'system': 10000,     // 10 seconds
                    'rendering': 15000,  // 15 seconds
                    'audioLatency': 8000 // 8 seconds
                };
                
                setTimeout(() => {
                    stopTest(testName);
                    
                    // If this was display test, we need to switch tabs before continuing
                    if (testName === 'keyboard') {
                        // Switch to display tests tab
                        const displayTab = document.querySelector('.tab[data-tab="display-tests"]');
                        displayTab.click();
                    } else if (testName === 'refresh') {
                        // Switch to system tests tab
                        const systemTab = document.querySelector('.tab[data-tab="system-tests"]');
                        systemTab.click();
                    } else if (testName === 'system') {
                        // Switch to GPU tests tab
                        const gpuTab = document.querySelector('.tab[data-tab="gpu-tests"]');
                        gpuTab.click();
                    } else if (testName === 'rendering') {
                        // Switch to audio tests tab
                        const audioTab = document.querySelector('.tab[data-tab="audio-tests"]');
                        audioTab.click();
                    }
                    
                    // Move to the next test
                    setTimeout(runNextTest, 1000);
                }, testDurations[testName]);
            }, 1000);
        }
        
        // Start the test sequence
        runNextTest();
    }

    /**
     * Check if enough tests have been completed to generate an overall score
     */
    function checkAllTestsCompleted() {
        // Count how many main test categories are complete
        let completedCategories = 0;
        let totalScore = 0;
        
        // Mouse tests
        if (testResults.mouse || testResults.click) {
            completedCategories++;
            totalScore += calculateMouseScore();
        }
        
        // Keyboard tests
        if (testResults.keyboard) {
            completedCategories++;
            totalScore += calculateKeyboardScore();
        }
        
        // Display tests
        if (testResults.refresh || testResults.motion || testResults.sync) {
            completedCategories++;
            totalScore += calculateDisplayScore();
        }
        
        // System tests
        if (testResults.system || testResults.cpu || testResults.memory) {
            completedCategories++;
            totalScore += calculateSystemScore();
        }
        
        // GPU tests
        if (testResults.rendering || testResults.shader || testResults.texture) {
            completedCategories++;
            totalScore += calculateGpuScore();
        }
        
        // Audio tests
        if (testResults.audioLatency || testResults.audioQuality) {
            completedCategories++;
            totalScore += calculateAudioScore();
        }
        
        // If at least 3 categories are complete, update the overall score
        if (completedCategories >= 3) {
            const finalScore = Math.round(totalScore / completedCategories);
            updateOverallScore(finalScore);
            generateRecommendations();
        }
    }

    /**
     * Calculate mouse test score
     * @returns {number} Score from 0-100
     */
    function calculateMouseScore() {
        // If we have mouse test results
        if (testResults.mouse) {
            // Mouse latency score (lower is better)
            const latencyScore = Math.max(0, 100 - testResults.mouse.avgDelay * 10);
            
            // Polling rate score (higher is better)
            const pollingScore = Math.min(100, testResults.mouse.estimatedPollingRate / 10);
            
            // Consistency score (lower stdDev is better)
            const consistencyScore = Math.max(0, 100 - testResults.mouse.stdDev * 20);
            
            // Weighted average (prioritize latency and polling rate)
            return Math.round(latencyScore * 0.5 + pollingScore * 0.3 + consistencyScore * 0.2);
        }
        
        // If we have click test results
        if (testResults.click) {
            // Reaction time score (lower is better, normalize around 250ms)
            const reactionScore = Math.max(0, 100 - (testResults.click.avgReactionTime - 150) / 2);
            
            // Accuracy score (higher is better)
            const accuracyScore = testResults.click.accuracy;
            
            // Weighted average
            return Math.round(reactionScore * 0.7 + accuracyScore * 0.3);
        }
        
        // If we don't have either, return 0
        return 0;
    }

    /**
     * Calculate keyboard test score
     * @returns {number} Score from 0-100
     */
    function calculateKeyboardScore() {
        if (!testResults.keyboard) return 0;
        
        // Latency score (lower is better)
        const latencyScore = Math.max(0, 100 - testResults.keyboard.avgHoldTime * 5);
        
        // Consistency score (lower stdDev is better)
        const consistencyScore = Math.max(0, 100 - testResults.keyboard.stdDev * 15);
        
        // Weighted average
        return Math.round(latencyScore * 0.7 + consistencyScore * 0.3);
    }

    /**
     * Calculate display test score
     * @returns {number} Score from 0-100
     */
    function calculateDisplayScore() {
        // Prioritize refresh rate test if available
        if (testResults.refresh) {
            // Refresh rate score (higher is better, normalize to 240Hz max)
            const refreshRateScore = Math.min(100, testResults.refresh.detectedRefreshRate / 2.4);
            
            // Jitter score (lower is better)
            const jitterScore = Math.max(0, 100 - testResults.refresh.jitter * 20);
            
            // Weighted average
            return Math.round(refreshRateScore * 0.7 + jitterScore * 0.3);
        }
        
        // Motion clarity test
        if (testResults.motion) {
            return testResults.motion.clarityScore;
        }
        
        // Sync test
        if (testResults.sync) {
            // Adaptive sync quality score
            return testResults.sync.syncQualityScore;
        }
        
        return 0;
    }

    /**
     * Calculate system test score
     * @returns {number} Score from 0-100
     */
    function calculateSystemScore() {
        // System latency test
        if (testResults.system) {
            // Lower latency is better
            const latencyScore = Math.max(0, 100 - testResults.system.combinedLatency * 5);
            
            // Precision score (lower is better)
            const precisionScore = Math.max(0, 100 - testResults.system.timingPrecision * 1000);
            
            // Weighted average
            return Math.round(latencyScore * 0.8 + precisionScore * 0.2);
        }
        
        // CPU test
        if (testResults.cpu) {
            // Single thread score (higher is better)
            const singleThreadScore = Math.min(100, testResults.cpu.singleThread);
            
            // Multi thread score (higher is better, normalized)
            const multiThreadScore = Math.min(100, testResults.cpu.multiThread / 4);
            
            // Weighted average (prioritize multi-thread for gaming)
            return Math.round(singleThreadScore * 0.4 + multiThreadScore * 0.6);
        }
        
        // Memory test
        if (testResults.memory) {
            return testResults.memory.performanceScore;
        }
        
        return 0;
    }

    /**
     * Calculate GPU test score
     * @returns {number} Score from 0-100
     */
    function calculateGpuScore() {
        // 3D rendering test
        if (testResults.rendering) {
            return testResults.rendering.performanceScore;
        }
        
        // Shader test
        if (testResults.shader) {
            return testResults.shader.complexityScore;
        }
        
        // Texture test
        if (testResults.texture) {
            return testResults.texture.streamingScore;
        }
        
        return 0;
    }

    /**
     * Calculate audio test score
     * @returns {number} Score from 0-100
     */
    function calculateAudioScore() {
        // Audio latency test
        if (testResults.audioLatency) {
            // Lower latency is better
            return Math.max(0, 100 - testResults.audioLatency.avgLatency * 10);
        }
        
        // Audio quality test
        if (testResults.audioQuality) {
            return testResults.audioQuality.qualityScore;
        }
        
        return 0;
    }

    /**
     * Update the overall score display
     * @param {number} score - Score from 0-100
     */
    function updateOverallScore(score) {
        const scoreValue = document.getElementById('score-value');
        const scoreGauge = document.getElementById('score-gauge');
        
        // Update the score value
        scoreValue.textContent = score;
        
        // Update the gauge color based on score
        if (score >= 90) {
            scoreGauge.style.background = 'conic-gradient(var(--success-color) 0%, var(--success-color) 100%)';
        } else if (score >= 75) {
            scoreGauge.style.background = 'conic-gradient(var(--primary-color) 0%, var(--primary-color) 100%)';
        } else if (score >= 60) {
            scoreGauge.style.background = 'conic-gradient(var(--warning-color) 0%, var(--warning-color) 100%)';
        } else {
            scoreGauge.style.background = 'conic-gradient(var(--danger-color) 0%, var(--danger-color) 100%)';
        }
        
        // Update results in comparison table
        updateComparisonTable();
    }

    /**
     * Update the comparison table with test results
     */
    function updateComparisonTable() {
        const tableBody = document.getElementById('results-table-body');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add mouse latency row
        if (testResults.mouse) {
            addComparisonRow('mouseLatency', `${testResults.mouse.avgDelay.toFixed(1)} ms`, '15-20 ms', '8-15 ms', '5-8 ms', '< 5 ms');
        }
        
        // Add reaction time row
        if (testResults.click) {
            addComparisonRow('reactionTime', `${testResults.click.avgReactionTime.toFixed(1)} ms`, '300-400 ms', '250-300 ms', '200-250 ms', '< 200 ms');
        }
        
        // Add keyboard latency row
        if (testResults.keyboard) {
            addComparisonRow('keyboardLatency', `${testResults.keyboard.avgHoldTime.toFixed(1)} ms`, '25-30 ms', '15-25 ms', '10-15 ms', '< 10 ms');
        }
        
        // Add refresh rate row
        if (testResults.refresh) {
            addComparisonRow('refreshRate', `${testResults.refresh.detectedRefreshRate} Hz`, '60 Hz', '144 Hz', '240 Hz', '360+ Hz');
        }
        
        // Add system latency row
        if (testResults.system) {
            addComparisonRow('systemLatency', `${testResults.system.combinedLatency.toFixed(1)} ms`, '30-40 ms', '20-30 ms', '10-20 ms', '< 10 ms');
        }
        
        // Add GPU performance row
        if (testResults.rendering) {
            const fpsValue = testResults.rendering.averageFPS || 0;
            addComparisonRow('gpuPerformance', `${fpsValue.toFixed(1)} FPS`, '30-60 FPS', '60-120 FPS', '120-240 FPS', '240+ FPS');
        }
        
        // Add audio latency row
        if (testResults.audioLatency) {
            addComparisonRow('audioLatency', `${testResults.audioLatency.avgLatency.toFixed(1)} ms`, '50-100 ms', '30-50 ms', '10-30 ms', '< 10 ms');
        }
    }

    /**
     * Add a row to the comparison table
     * @param {string} paramName - Parameter name translation key
     * @param {string} yourValue - Your measured value
     * @param {string} casualValue - Casual gamer value
     * @param {string} competitiveValue - Competitive gamer value
     * @param {string} proValue - Pro gamer value
     * @param {string} esportsValue - E-sports athlete value
     */
    function addComparisonRow(paramName, yourValue, casualValue, competitiveValue, proValue, esportsValue) {
        const tableBody = document.getElementById('results-table-body');
        
        const row = document.createElement('tr');
        
        // Parameter name cell
        const paramCell = document.createElement('td');
        paramCell.textContent = getTranslation(paramName);
        row.appendChild(paramCell);
        
        // Your value cell
        const yourCell = document.createElement('td');
        yourCell.textContent = yourValue;
        yourCell.className = 'your-score';
        row.appendChild(yourCell);
        
        // Casual gamer cell
        const casualCell = document.createElement('td');
        casualCell.textContent = casualValue;
        row.appendChild(casualCell);
        
        // Competitive gamer cell
        const competitiveCell = document.createElement('td');
        competitiveCell.textContent = competitiveValue;
        row.appendChild(competitiveCell);
        
        // Pro gamer cell
        const proCell = document.createElement('td');
        proCell.textContent = proValue;
        row.appendChild(proCell);
        
        // E-sports athlete cell
        const esportsCell = document.createElement('td');
        esportsCell.textContent = esportsValue;
        row.appendChild(esportsCell);
        
        // Add the row to the table
        tableBody.appendChild(row);
    }

    /**
     * Generate recommendations based on test results
     */
    function generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-content');
        let html = '<ul class="recommendations-list">';
        
        // Mouse recommendations
        if (testResults.mouse) {
            if (testResults.mouse.avgDelay > 10) {
                html += `<li><strong>${getTranslation('mouse')}:</strong> ${getTranslation('mouseHighLatency')}</li>`;
            } else if (testResults.mouse.avgDelay > 5) {
                html += `<li><strong>${getTranslation('mouse')}:</strong> ${getTranslation('mouseAverageLatency')}</li>`;
            }
            
            if (testResults.mouse.estimatedPollingRate < 500) {
                html += `<li><strong>${getTranslation('mousePollingRate')}:</strong> ${getTranslation('mouseLowPollingRate')}</li>`;
            }
        }
        
        // Keyboard recommendations
        if (testResults.keyboard) {
            if (testResults.keyboard.avgHoldTime > 20) {
                html += `<li><strong>${getTranslation('keyboard')}:</strong> ${getTranslation('keyboardHighLatency')}</li>`;
            } else if (testResults.keyboard.avgHoldTime > 10) {
                html += `<li><strong>${getTranslation('keyboard')}:</strong> ${getTranslation('keyboardAverageLatency')}</li>`;
            }
        }
        
        // Display recommendations
        if (testResults.refresh) {
            if (testResults.refresh.detectedRefreshRate <= 60) {
                html += `<li><strong>${getTranslation('monitor')}:</strong> ${getTranslation('monitorLowRefreshRate')}</li>`;
            } else if (testResults.refresh.detectedRefreshRate <= 144) {
                html += `<li><strong>${getTranslation('monitor')}:</strong> ${getTranslation('monitorAverageRefreshRate')}</li>`;
            }
            
            if (testResults.refresh.jitter > 2) {
                html += `<li><strong>${getTranslation('monitorJitter')}:</strong> ${getTranslation('monitorHighJitter')}</li>`;
            }
        }
        
        // System recommendations
        if (testResults.system) {
            if (testResults.system.combinedLatency > 20) {
                html += `<li><strong>${getTranslation('system')}:</strong> ${getTranslation('systemHighLatency')}</li>`;
            } else if (testResults.system.combinedLatency > 12) {
                html += `<li><strong>${getTranslation('system')}:</strong> ${getTranslation('systemAverageLatency')}</li>`;
            }
        }
        
        // CPU recommendations
        if (testResults.cpu) {
            if (testResults.cpu.singleThread < 40) {
                html += `<li><strong>${getTranslation('cpu')}:</strong> ${getTranslation('cpuLowPerformance')}</li>`;
            }
            
            if (testResults.cpu.workersCount < 4) {
                html += `<li><strong>${getTranslation('cpuThreads')}:</strong> ${getTranslation('cpuLowThreadCount')}</li>`;
            }
        }
        
        // GPU recommendations
        if (testResults.rendering) {
            if (testResults.rendering.averageFPS < 60) {
                html += `<li><strong>${getTranslation('gpu')}:</strong> ${getTranslation('gpuLowPerformance')}</li>`;
            } else if (testResults.rendering.averageFPS < 120) {
                html += `<li><strong>${getTranslation('gpu')}:</strong> ${getTranslation('gpuAveragePerformance')}</li>`;
            }
        }
        
        // Audio recommendations
        if (testResults.audioLatency) {
            if (testResults.audioLatency.avgLatency > 50) {
                html += `<li><strong>${getTranslation('audio')}:</strong> ${getTranslation('audioHighLatency')}</li>`;
            }
        }
        
        // General recommendations
        html += `
            <li><strong>${getTranslation('generalSettings')}:</strong> ${getTranslation('generalSettingsRecommendation')}</li>
            <li><strong>${getTranslation('drivers')}:</strong> ${getTranslation('driversRecommendation')}</li>
            <li><strong>${getTranslation('gameSettings')}:</strong> ${getTranslation('gameSettingsRecommendation')}</li>
        `;
        
        html += '</ul>';
        
        recommendationsContainer.innerHTML = html;
    }

    /**
     * Show final results and switch to the results tab
     */
    function showResults() {
        // Calculate final score
        checkAllTestsCompleted();
        
        // Switch to results tab
        const resultsTab = document.querySelector('.tab[data-tab="results"]');
        resultsTab.click();
    }

    /**
     * Export test results to a JSON file
     */
    function exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            overallScore: document.getElementById('score-value').textContent,
            systemInfo: getSystemInfo(),
            testResults: testResults,
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
            }
        };
        
        // Create a blob with the data
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a link to download the file and click it
        const a = document.createElement('a');
        a.href = url;
        a.download = `gaming-performance-results-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Share test results (generate a shareable link or image)
     */
    function shareResults() {
        // Get the overall score
        const score = document.getElementById('score-value').textContent;
        
        // Create share text
        const shareText = `I scored ${score}/100 on the Ultimate Gaming Performance Analyzer! Test your gaming setup at: ultraperformance.test`;
        
        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: 'My Gaming Performance Score',
                text: shareText,
                url: window.location.href
            })
            .catch(error => {
                console.error('Error sharing:', error);
                // Fallback to clipboard
                copyToClipboard(shareText);
            });
        } else {
            // Fallback to clipboard
            copyToClipboard(shareText);
        }
    }

    /**
     * Copy text to clipboard and show notification
     * @param {string} text - Text to copy
     */
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert(getTranslation('copiedToClipboard'));
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert(getTranslation('failedToCopy'));
            });
    }

    /**
     * Get system information
     * @returns {Object} System information
     */
    function getSystemInfo() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            vendor: navigator.vendor,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : 'unknown'
        };
    }

    /**
     * Initialize settings
     */
    function initSettings() {
        // Load settings from localStorage if available
        loadSettings();
        
        // Set up event listeners for settings changes
        document.getElementById('high-precision-mode').addEventListener('change', saveSettings);
        document.getElementById('advanced-stats').addEventListener('change', saveSettings);
        document.getElementById('filter-outliers').addEventListener('change', saveSettings);
        document.getElementById('sample-count').addEventListener('change', saveSettings);
        document.getElementById('dark-mode').addEventListener('change', toggleDarkMode);
        document.getElementById('enable-animations').addEventListener('change', toggleAnimations);
        document.getElementById('color-theme').addEventListener('change', changeColorTheme);
        document.getElementById('debug-mode').addEventListener('change', saveSettings);
        document.getElementById('noise-reduction').addEventListener('change', saveSettings);
        document.getElementById('force-gpu').addEventListener('change', saveSettings);
    }

    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('performanceAnalyzerSettings'));
            
            if (settings) {
                // Apply saved settings
                document.getElementById('high-precision-mode').checked = settings.highPrecision !== false;
                document.getElementById('advanced-stats').checked = settings.advancedStats !== false;
                document.getElementById('filter-outliers').checked = settings.filterOutliers !== false;
                document.getElementById('sample-count').value = settings.sampleCount || '50';
                document.getElementById('dark-mode').checked = settings.darkMode !== false;
                document.getElementById('enable-animations').checked = settings.enableAnimations !== false;
                document.getElementById('color-theme').value = settings.colorTheme || 'default';
                document.getElementById('debug-mode').checked = settings.debugMode === true;
                document.getElementById('noise-reduction').value = settings.noiseReduction || 'average';
                document.getElementById('force-gpu').checked = settings.forceGpu === true;
                
                // Apply theme and animation settings
                toggleDarkMode();
                toggleAnimations();
                changeColorTheme();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        const settings = {
            highPrecision: document.getElementById('high-precision-mode').checked,
            advancedStats: document.getElementById('advanced-stats').checked,
            filterOutliers: document.getElementById('filter-outliers').checked,
            sampleCount: document.getElementById('sample-count').value,
            darkMode: document.getElementById('dark-mode').checked,
            enableAnimations: document.getElementById('enable-animations').checked,
            colorTheme: document.getElementById('color-theme').value,
            debugMode: document.getElementById('debug-mode').checked,
            noiseReduction: document.getElementById('noise-reduction').value,
            forceGpu: document.getElementById('force-gpu').checked
        };
        
        localStorage.setItem('performanceAnalyzerSettings', JSON.stringify(settings));
    }

    /**
     * Toggle dark mode
     */
    function toggleDarkMode() {
        const darkModeEnabled = document.getElementById('dark-mode').checked;
        
        if (darkModeEnabled) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        
        saveSettings();
    }

    /**
     * Toggle animations
     */
    function toggleAnimations() {
        const animationsEnabled = document.getElementById('enable-animations').checked;
        
        if (animationsEnabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
        
        saveSettings();
    }

    /**
     * Change color theme
     */
    function changeColorTheme() {
        const theme = document.getElementById('color-theme').value;
        
        // Remove all theme classes
        document.body.classList.remove('gaming-theme', 'professional-theme', 'high-contrast-theme');
        
        // Add selected theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-theme`);
        }
        
        saveSettings();
    }

    /**
     * Reset all settings to defaults
     */
    function resetSettings() {
        if (confirm(getTranslation('confirmResetSettings'))) {
            // Clear settings from localStorage
            localStorage.removeItem('performanceAnalyzerSettings');
            
            // Reset form elements
            document.getElementById('high-precision-mode').checked = true;
            document.getElementById('advanced-stats').checked = true;
            document.getElementById('filter-outliers').checked = true;
            document.getElementById('sample-count').value = '50';
            document.getElementById('dark-mode').checked = true;
            document.getElementById('enable-animations').checked = true;
            document.getElementById('color-theme').value = 'default';
            document.getElementById('debug-mode').checked = false;
            document.getElementById('noise-reduction').value = 'average';
            document.getElementById('force-gpu').checked = false;
            
            // Apply default settings
            toggleDarkMode();
            toggleAnimations();
            changeColorTheme();
            
            alert(getTranslation('settingsReset'));
        }
    }

    /**
     * Check browser compatibility and display warnings if needed
     */
    function checkEnvironment() {
        const browserInfo = document.getElementById('browser-info');
        const environmentWarning = document.getElementById('environment-warning');
        
        // Detect browser
        const browser = BrowserDetect.detectBrowser();
        
        // Check if in fullscreen mode
        const isFullscreen = BrowserDetect.isFullscreen();
        
        // Display browser info
        browserInfo.innerHTML = `
            <i class="fas ${browser.icon}"></i>
            <span>${browser.name}</span>
        `;
        
        // Add warning class if not Chrome or Edge
        if (browser.name !== 'Chrome' && browser.name !== 'Edge') {
            browserInfo.classList.add('browser-warning');
        }
        
        // Show warning for non-Chrome/Edge browsers or if not in fullscreen
        if ((browser.name !== 'Chrome' && browser.name !== 'Edge') || !isFullscreen) {
            environmentWarning.style.display = 'flex';
            
            let warningMessage = '';
            
            if (browser.name !== 'Chrome' && browser.name !== 'Edge') {
                warningMessage += `${getTranslation('browserWarning')} `;
            }
            
            if (!isFullscreen) {
                warningMessage += `${getTranslation('fullscreenWarning')} `;
            }
            
            environmentWarning.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${getTranslation('warning')}</strong>
                    <p>${warningMessage}</p>
                </div>
                <button id="dismiss-warning"><i class="fas fa-times"></i></button>
            `;
            
            // Add event listener to dismiss button
            document.getElementById('dismiss-warning').addEventListener('click', () => {
                environmentWarning.style.display = 'none';
            });
        }
    }

    /**
     * Setup fullscreen toggle
     */
    function setupFullscreenToggle() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                    .then(() => {
                        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                        checkEnvironment(); // Recheck environment after entering fullscreen
                    })
                    .catch(err => {
                        console.error('Error attempting to enable fullscreen:', err);
                    });
            } else {
                document.exitFullscreen()
                    .then(() => {
                        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                        checkEnvironment(); // Recheck environment after exiting fullscreen
                    })
                    .catch(err => {
                        console.error('Error attempting to exit fullscreen:', err);
                    });
            }
        });
    }

    /**
     * Collect system information and display it
     */
    function collectSystemInfo() {
        const systemInfoContainer = document.getElementById('system-information');
        
        // Get hardware concurrency (CPU cores/threads)
        const cpuInfo = navigator.hardwareConcurrency || 'Unknown';
        
        // Get memory info if available
        const memoryInfo = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
        
        // Get display info
        const displayInfo = {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio
        };
        
        // Get browser and platform info
        const browserInfo = BrowserDetect.detectBrowser();
        const platformInfo = navigator.platform;
        
        // Get GPU info (this is limited in browsers)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let gpuInfo = 'Unknown';
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
        
        // Display system information
        systemInfoContainer.innerHTML = `
            <div class="system-info-item">
                <h4><i class="fas fa-microchip"></i> ${getTranslation('cpu')}</h4>
                <p>${cpuInfo} ${getTranslation('coresThreads')}</p>
            </div>
            <div class="system-info-item">
                <h4><i class="fas fa-memory"></i> ${getTranslation('memory')}</h4>
                <p>${memoryInfo}</p>
            </div>
            <div class="system-info-item">
                <h4><i class="fas fa-desktop"></i> ${getTranslation('display')}</h4>
                <p>${displayInfo.width}x${displayInfo.height}, ${displayInfo.pixelRatio}x ${getTranslation('pixelRatio')}</p>
            </div>
            <div class="system-info-item">
                <h4><i class="fas fa-bolt"></i> ${getTranslation('gpu')}</h4>
                <p>${gpuInfo}</p>
            </div>
            <div class="system-info-item">
                <h4><i class="fas ${browserInfo.icon}"></i> ${getTranslation('browser')}</h4>
                <p>${browserInfo.name} ${browserInfo.version}</p>
            </div>
            <div class="system-info-item">
                <h4><i class="fas fa-laptop"></i> ${getTranslation('platform')}</h4>
                <p>${platformInfo}</p>
            </div>
        `;
    }

    /**
     * Initialize language based on browser settings and setup translator
     */
    function initializeLanguage() {
        // The language detection and translation is handled by the translator.js module
        Translator.init();
        
        // Show detected language in the language display
        const languageDisplay = document.getElementById('language-display');
        const currentLanguage = Translator.getCurrentLanguage();
        
        languageDisplay.innerHTML = `
            <i class="fas fa-globe"></i>
            <span>${currentLanguage.name}</span>
        `;
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    function getTranslation(key) {
        return Translator.translate(key);
    }

    // Expose necessary functions and variables to the global scope for other modules
    window.gamePerformanceAnalyzer = {
        testResults,
        activeTests,
        getTranslation,
        getSystemInfo,
        calculateMouseScore,
        calculateKeyboardScore,
        calculateDisplayScore,
        calculateSystemScore,
        calculateGpuScore,
        calculateAudioScore,
        updateComparisonTable,
        checkAllTestsCompleted,
        updateOverallScore,
        generateRecommendations
    };
});