/**
 * Ultimate Gaming Performance Analyzer
 * Keyboard Test Module
 * 
 * This module handles keyboard latency tests.
 */

const KeyboardTest = (function() {
    // Test state variables
    let keyboardTestActive = false;
    
    // Test data storage
    let keyboardEvents = [];
    
    // Test UI elements
    let keyboardTestArea = null;
    let keyOverlay = null;
    let keyboardChart = null;
    
    /**
     * Initialize the keyboard test
     */
    function initKeyboardTest() {
        keyboardTestArea = document.getElementById('keyboard-test-area');
        
        // Create test area content
        keyboardTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('keyboardTestInstructions')}</p>
            </div>
            <div class="key-display">${Translator.translate('pressAnyKey')}</div>
            <div class="key-overlay" id="key-overlay"></div>
        `;
        
        // Set up keyboard test area
        keyboardTestArea.style.position = 'relative';
        
        // Get key overlay element
        keyOverlay = document.getElementById('key-overlay');
    }
    
    /**
     * Start the keyboard latency test
     */
    function startKeyboardTest() {
        // Initialize test if needed
        if (!keyboardTestArea) {
            initKeyboardTest();
        }
        
        // Reset test data
        keyboardTestActive = true;
        keyboardEvents = [];
        
        // Set up results container
        const resultsContainer = document.getElementById('keyboard-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('pressKeysInstructions')}</p>
            <div class="chart-container">
                <canvas id="keyboard-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('keyboard-chart').getContext('2d');
        keyboardChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: Translator.translate('keyPressTime') + ' (ms)',
                    data: [],
                    backgroundColor: 'rgba(3, 218, 198, 0.6)',
                    borderColor: 'rgb(3, 218, 198)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('key')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: Translator.translate('timeMs')
                        }
                    }
                }
            }
        });
        
        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
    
    /**
     * Stop the keyboard latency test
     */
    function stopKeyboardTest() {
        keyboardTestActive = false;
        
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        
        // Analyze and display results
        analyzeKeyboardResults();
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} e - Key event
     */
    function handleKeyDown(e) {
        if (!keyboardTestActive) return;
        
        // Prevent default behavior
        e.preventDefault();
        
        const now = performance.now();
        
        // Store event data
        keyboardEvents.push({
            type: 'down',
            key: e.key,
            code: e.code,
            time: now
        });
        
        // Show visual feedback
        keyboardTestArea.querySelector('.key-display').textContent = `${Translator.translate('pressed')}: ${e.key}`;
        keyOverlay.textContent = e.key;
        keyOverlay.classList.add('active');
    }
    
    /**
     * Handle key up event
     * @param {KeyboardEvent} e - Key event
     */
    function handleKeyUp(e) {
        if (!keyboardTestActive) return;
        
        // Prevent default behavior
        e.preventDefault();
        
        const now = performance.now();
        
        // Store event data
        keyboardEvents.push({
            type: 'up',
            key: e.key,
            code: e.code,
            time: now
        });
        
        // Find matching keydown event
        const matchingDownEvent = [...keyboardEvents].reverse().find(event => 
            event.type === 'down' && event.key === e.key
        );
        
        if (matchingDownEvent) {
            const holdTime = now - matchingDownEvent.time;
            
            // Update display
            keyboardTestArea.querySelector('.key-display').textContent = 
                `${Translator.translate('pressed')}: ${e.key} (${holdTime.toFixed(2)} ms)`;
            
            // Hide key overlay
            keyOverlay.classList.remove('active');
            
            // Update chart
            updateKeyboardChart();
        }
    }
    
    /**
     * Update keyboard chart with latest data
     */
    function updateKeyboardChart() {
        // Calculate key press durations for each key
        const keyPressData = {};
        const keyCodes = new Set();
        
        for (let i = 0; i < keyboardEvents.length; i++) {
            const evt = keyboardEvents[i];
            
            if (evt.type === 'up') {
                // Find matching keydown event
                const matchingDownEvent = [...keyboardEvents].slice(0, i).reverse().find(e => 
                    e.type === 'down' && e.key === evt.key
                );
                
                if (matchingDownEvent) {
                    const holdTime = evt.time - matchingDownEvent.time;
                    const code = evt.code || evt.key;
                    keyCodes.add(code);
                    
                    if (!keyPressData[code]) {
                        keyPressData[code] = [];
                    }
                    
                    keyPressData[code].push(holdTime);
                }
            }
        }
        
        // Calculate average hold time for each key
        const labels = [];
        const data = [];
        
        for (const code of keyCodes) {
            if (keyPressData[code] && keyPressData[code].length > 0) {
                labels.push(formatKeyCode(code));
                data.push(StatsAnalyzer.calculateAverage(keyPressData[code]));
            }
        }
        
        // Only show the last 15 keys for readability
        const lastLabels = labels.slice(-15);
        const lastData = data.slice(-15);
        
        // Update chart
        if (keyboardChart) {
            keyboardChart.data.labels = lastLabels;
            keyboardChart.data.datasets[0].data = lastData;
            keyboardChart.update();
        }
    }
    
    /**
     * Format key code for display
     * @param {string} code - Key code
     * @returns {string} Formatted key code
     */
    function formatKeyCode(code) {
        return code
            .replace('Key', '')
            .replace('Digit', '')
            .replace('Numpad', 'Num')
            .replace('Arrow', '')
            .replace('Control', 'Ctrl')
            .replace('ShiftLeft', 'LShift')
            .replace('ShiftRight', 'RShift')
            .replace('AltLeft', 'LAlt')
            .replace('AltRight', 'RAlt');
    }
    
    /**
     * Analyze keyboard test results
     */
    function analyzeKeyboardResults() {
        // Check if we have enough data
        if (keyboardEvents.length < 10) {
            document.getElementById('keyboard-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreKeyboardData')}</p>
            `;
            return;
        }
        
        // Calculate hold times for all keys
        const holdTimes = [];
        const keyPressData = {};
        const keyFrequencies = {};
        
        for (let i = 0; i < keyboardEvents.length; i++) {
            const evt = keyboardEvents[i];
            
            // Count key frequencies
            if (evt.type === 'down') {
                keyFrequencies[evt.key] = (keyFrequencies[evt.key] || 0) + 1;
            }
            
            // Calculate hold times (up - down)
            if (evt.type === 'up') {
                const matchingDownEvent = [...keyboardEvents].slice(0, i).reverse().find(e => 
                    e.type === 'down' && e.key === evt.key
                );
                
                if (matchingDownEvent) {
                    const holdTime = evt.time - matchingDownEvent.time;
                    holdTimes.push(holdTime);
                    
                    const code = evt.code || evt.key;
                    if (!keyPressData[code]) {
                        keyPressData[code] = [];
                    }
                    keyPressData[code].push(holdTime);
                }
            }
        }
        
        // Check if we have enough hold times
        if (holdTimes.length < 5) {
            document.getElementById('keyboard-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreKeyboardData')}</p>
            `;
            return;
        }
        
        // Filter outliers if enabled
        let filteredHoldTimes = holdTimes;
        if (document.getElementById('filter-outliers').checked) {
            filteredHoldTimes = StatsAnalyzer.filterOutliers(holdTimes);
        }
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            filteredHoldTimes = StatsAnalyzer.applyNoiseReduction(filteredHoldTimes, noiseReductionMethod);
        }
        
        // Calculate statistics
        const avgHoldTime = StatsAnalyzer.calculateAverage(filteredHoldTimes);
        const minHoldTime = StatsAnalyzer.calculateMin(filteredHoldTimes);
        const maxHoldTime = StatsAnalyzer.calculateMax(filteredHoldTimes);
        const stdDev = StatsAnalyzer.calculateStandardDeviation(filteredHoldTimes);
        
        // Find the fastest and slowest keys
        let fastestKey = '';
        let slowestKey = '';
        let fastestTime = Infinity;
        let slowestTime = 0;
        
        for (const [key, times] of Object.entries(keyPressData)) {
            if (times.length >= 2) {
                const avgTime = StatsAnalyzer.calculateAverage(times);
                if (avgTime < fastestTime) {
                    fastestTime = avgTime;
                    fastestKey = key;
                }
                if (avgTime > slowestTime) {
                    slowestTime = avgTime;
                    slowestKey = key;
                }
            }
        }
        
        // Find most used key
        let mostUsedKey = '';
        let maxUses = 0;
        for (const [key, count] of Object.entries(keyFrequencies)) {
            if (count > maxUses) {
                maxUses = count;
                mostUsedKey = key;
            }
        }
        
        // Store results in global test results
        window.gamePerformanceAnalyzer.testResults.keyboard = {
            avgHoldTime: avgHoldTime,
            minHoldTime: minHoldTime,
            maxHoldTime: maxHoldTime,
            stdDev: stdDev,
            keyCount: Object.keys(keyPressData).length,
            sampleCount: holdTimes.length
        };
        
        // Get ratings
        const avgHoldTimeRating = StatsAnalyzer.rateMetric(avgHoldTime, 10, 15, 20, 25);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('keyboardTestResults')}</h3>
            <div class="chart-container">
                <canvas id="keyboard-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageKeyPressTime')}</td>
                    <td>${avgHoldTime.toFixed(2)} ms</td>
                    <td><span class="rating ${avgHoldTimeRating.ratingClass}">${Translator.translate(avgHoldTimeRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumKeyPressTime')}</td>
                    <td>${minHoldTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumKeyPressTime')}</td>
                    <td>${maxHoldTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('standardDeviation')}</td>
                    <td>${stdDev.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('fastestKey')}</td>
                    <td>${formatKeyCode(fastestKey)} (${fastestTime.toFixed(2)} ms)</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('slowestKey')}</td>
                    <td>${formatKeyCode(slowestKey)} (${slowestTime.toFixed(2)} ms)</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('keyPressCount')}</td>
                    <td>${holdTimes.length}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('keyboardInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const consistency = 100 - (stdDev / avgHoldTime * 100); // consistency %
            const keyboardType = detectKeyboardType(avgHoldTime, stdDev);
            
            const consistencyRating = StatsAnalyzer.rateMetric(consistency, 95, 90, 80, 70, true);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('keyboardConsistency')}</td>
                    <td>${consistency.toFixed(2)}%</td>
                    <td><span class="rating ${consistencyRating.ratingClass}">${Translator.translate(consistencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('probableKeyboardType')}</td>
                    <td>${Translator.translate(keyboardType)}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('keyStability')}</td>
                    <td>${(100 - Math.min(100, stdDev / avgHoldTime * 200)).toFixed(1)}%</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('mostUsedKey')}</td>
                    <td>${mostUsedKey} (${maxUses} ${Translator.translate('times')})</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('keyboardTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                const histogram = StatsAnalyzer.createHistogram(filteredHoldTimes, 10);
                
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <p>${Translator.translate('keyPressDistribution')}:</p>
                <div class="debug-chart-container">
                    <canvas id="keyboard-histogram-chart"></canvas>
                </div>
                <p>${Translator.translate('uniqueKeysPressed')}: ${Object.keys(keyPressData).length}</p>
                `;
            }
        }
        
        // Update results container
        document.getElementById('keyboard-results').innerHTML = html;
        
        // Create results chart
        createKeyboardResultsChart(keyPressData);
        
        // Create histogram chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            createKeyboardHistogram(filteredHoldTimes);
        }
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create keyboard results chart
     * @param {Object} keyPressData - Key press data by key
     */
    function createKeyboardResultsChart(keyPressData) {
        // Calculate average hold time for each key
        const keyData = [];
        
        for (const [key, times] of Object.entries(keyPressData)) {
            if (times.length > 0) {
                keyData.push({
                    key: formatKeyCode(key),
                    avgTime: StatsAnalyzer.calculateAverage(times),
                    count: times.length
                });
            }
        }
        
        // Sort by most used keys
        keyData.sort((a, b) => b.count - a.count);
        
        // Only show the top 15 most used keys
        const topKeys = keyData.slice(0, 15);
        
        // Prepare chart data
        const labels = topKeys.map(k => k.key);
        const data = topKeys.map(k => k.avgTime);
        
        // Create chart
        const ctx = document.getElementById('keyboard-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: Translator.translate('keyPressTime') + ' (ms)',
                    data: data,
                    backgroundColor: 'rgba(3, 218, 198, 0.6)',
                    borderColor: 'rgb(3, 218, 198)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('key')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: Translator.translate('timeMs')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create keyboard histogram chart
     * @param {Array<number>} holdTimes - Hold times data
     */
    function createKeyboardHistogram(holdTimes) {
        const histogram = StatsAnalyzer.createHistogram(holdTimes, 10);
        
        const histCtx = document.getElementById('keyboard-histogram-chart').getContext('2d');
        new Chart(histCtx, {
            type: 'bar',
            data: {
                labels: histogram.binEdges.slice(0, -1).map((v, i) => 
                    `${v.toFixed(1)}-${histogram.binEdges[i+1].toFixed(1)} ms`),
                datasets: [{
                    label: Translator.translate('frequency'),
                    data: histogram.frequencies,
                    backgroundColor: 'rgba(3, 218, 198, 0.6)',
                    borderColor: 'rgb(3, 218, 198)',
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
                            text: Translator.translate('keyPressTimeRange')
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
     * Detect keyboard type based on keypress characteristics
     * @param {number} avgTime - Average hold time
     * @param {number} stdDev - Standard deviation
     * @returns {string} Keyboard type
     */
    function detectKeyboardType(avgTime, stdDev) {
        // Detection logic based on timing characteristics
        if (avgTime < 10 && stdDev < 3) {
            return 'premiumMechanical';
        } else if (avgTime < 15 && stdDev < 5) {
            return 'gamingMechanical';
        } else if (avgTime < 20 && stdDev < 7) {
            return 'hybridOfficeMechanical';
        } else if (avgTime < 25 && stdDev < 10) {
            return 'gamingMembrane';
        } else {
            return 'standardMembrane';
        }
    }
    
    // Public API
    return {
        startKeyboardTest,
        stopKeyboardTest
    };
})();