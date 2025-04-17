/**
 * Ultimate Gaming Performance Analyzer
 * Mouse Test Module
 * 
 * This module handles mouse latency and reaction time tests.
 */

const MouseTest = (function() {
    // Test state variables
    let mouseTestActive = false;
    let clickTestActive = false;
    
    // Test data storage
    let mouseEvents = [];
    let mousePositions = [];
    let clickEvents = [];
    let targetPositions = [];
    
    // Test UI elements
    let mouseTestArea = null;
    let clickTestArea = null;
    let targetCircle = null;
    let clickTestInterval = null;
    let clickStartTime = 0;
    
    // Charts
    let mouseChart = null;
    let clickChart = null;
    
    /**
     * Initialize the mouse test
     */
    function initMouseTest() {
        mouseTestArea = document.getElementById('mouse-test-area');
        
        // Create test area content
        mouseTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('mouseTestInstructions')}</p>
            </div>
            <div class="test-visualization-area" id="mouse-visualization-area">
                <!-- Mouse movements will be visualized here -->
            </div>
        `;
        
        // Set up mouse test area
        mouseTestArea.style.position = 'relative';
        mouseTestArea.style.cursor = 'crosshair';
        
        // Add mouse event listeners
        mouseTestArea.addEventListener('mousemove', handleMouseMove);
    }
    
    /**
     * Initialize the click test
     */
    function initClickTest() {
        clickTestArea = document.getElementById('click-test-area');
        
        // Create test area content
        clickTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('clickTestInstructions')}</p>
            </div>
            <div class="target-circle" id="target-circle" style="display:none;">
                ${Translator.translate('click')}!
            </div>
        `;
        
        // Set up click test area
        clickTestArea.style.position = 'relative';
        
        // Get target circle
        targetCircle = document.getElementById('target-circle');
        
        // Add click event listener
        clickTestArea.addEventListener('click', handleTargetClick);
    }
    
    /**
     * Start the mouse latency test
     */
    function startMouseTest() {
        // Initialize test if needed
        if (!mouseTestArea) {
            initMouseTest();
        }
        
        // Reset test data
        mouseTestActive = true;
        mouseEvents = [];
        mousePositions = [];
        
        // Clear any previous trails
        const trails = mouseTestArea.querySelectorAll('.trail, .motion-trail');
        trails.forEach(trail => trail.remove());
        
        // Set up results container
        const resultsContainer = document.getElementById('mouse-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('moveMouseInstructions')}</p>
            <div class="chart-container">
                <canvas id="mouse-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('mouse-chart').getContext('2d');
        mouseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: Translator.translate('mouseLatency') + ' (ms)',
                    data: [],
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 2
                }]
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
                            text: Translator.translate('sampleNumber')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: Translator.translate('latencyMs')
                        },
                        min: 0
                    }
                }
            }
        });
    }
    
    /**
     * Stop the mouse latency test
     */
    function stopMouseTest() {
        mouseTestActive = false;
        
        // Analyze and display results
        analyzeMouseResults();
    }
    
    /**
     * Start the click reaction test
     */
    function startClickTest() {
        // Initialize test if needed
        if (!clickTestArea) {
            initClickTest();
        }
        
        // Reset test data
        clickTestActive = true;
        clickEvents = [];
        targetPositions = [];
        
        // Set up results container
        const resultsContainer = document.getElementById('click-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('clickTargetsInstructions')}</p>
            <div class="chart-container">
                <canvas id="click-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('click-chart').getContext('2d');
        clickChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: Translator.translate('reactionTime') + ' (ms)',
                    data: [],
                    backgroundColor: 'rgba(255, 152, 0, 0.6)',
                    borderColor: 'rgb(255, 152, 0)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${Translator.translate('reactionTime')}: ${context.parsed.y.toFixed(1)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('attemptNumber')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: Translator.translate('reactionTimeMs')
                        },
                        min: 0
                    }
                }
            }
        });
        
        // Show the first target after a delay
        setTimeout(showNextTarget, 1500);
    }
    
    /**
     * Stop the click reaction test
     */
    function stopClickTest() {
        clickTestActive = false;
        
        // Hide target
        if (targetCircle) {
            targetCircle.style.display = 'none';
        }
        
        // Clear any pending timeouts
        if (clickTestInterval) {
            clearTimeout(clickTestInterval);
            clickTestInterval = null;
        }
        
        // Analyze and display results
        analyzeClickResults();
    }
    
    /**
     * Handle mouse movement event
     * @param {MouseEvent} e - Mouse event
     */
    function handleMouseMove(e) {
        if (!mouseTestActive) return;
        
        const now = performance.now();
        const rect = mouseTestArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Store event data
        mouseEvents.push({
            time: now,
            x: x,
            y: y,
            speed: mousePositions.length > 0 ? 
                Math.sqrt(Math.pow(x - mousePositions[mousePositions.length-1].x, 2) + 
                         Math.pow(y - mousePositions[mousePositions.length-1].y, 2)) : 0
        });
        
        mousePositions.push({
            x: x,
            y: y,
            time: now
        });
        
        // Check if we should use high precision mode
        const highPrecision = document.getElementById('high-precision-mode').checked;
        
        // Add visual trail effect
        addMouseTrail(x, y, highPrecision);
        
        // Update chart in real-time
        updateMouseChart();
    }
    
    /**
     * Add visual trail for mouse movement
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} highPrecision - Whether to use high precision mode
     */
    function addMouseTrail(x, y, highPrecision) {
        // Create trail element
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        
        // Add color effect based on speed
        if (mouseEvents.length > 1) {
            const speed = mouseEvents[mouseEvents.length-1].speed;
            const hue = Math.min(280, Math.max(180, 280 - speed));
            trail.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
            trail.style.boxShadow = `0 0 8px hsl(${hue}, 100%, 50%, 0.8)`;
            
            // Add motion trails for high precision mode
            if (highPrecision) {
                for (let i = 1; i <= 3; i++) {
                    const motionTrail = document.createElement('div');
                    motionTrail.className = 'motion-trail';
                    motionTrail.style.width = `${6 + i*2}px`;
                    motionTrail.style.height = `${6 + i*2}px`;
                    motionTrail.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
                    motionTrail.style.left = `${x}px`;
                    motionTrail.style.top = `${y}px`;
                    motionTrail.style.opacity = `${0.3 - i*0.07}`;
                    mouseTestArea.appendChild(motionTrail);
                    
                    // Remove motion trail after a short delay
                    setTimeout(() => {
                        if (motionTrail.parentNode) {
                            motionTrail.parentNode.removeChild(motionTrail);
                        }
                    }, 100 + i*30);
                }
            }
        }
        
        // Add trail to DOM
        mouseTestArea.appendChild(trail);
        
        // Remove trail after a delay
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 500);
    }
    
    /**
     * Update mouse chart with latest data
     */
    function updateMouseChart() {
        if (!mouseChart || mouseEvents.length <= 1) return;
        
        // Calculate delays between events
        const delays = [];
        for (let i = 1; i < mouseEvents.length; i++) {
            delays.push(mouseEvents[i].time - mouseEvents[i-1].time);
        }
        
        // Show only the last 50 points for better readability
        const lastDelays = delays.slice(-50);
        const labels = Array.from({length: lastDelays.length}, (_, i) => i + 1);
        
        // Update chart data
        mouseChart.data.labels = labels;
        mouseChart.data.datasets[0].data = lastDelays;
        mouseChart.update();
    }
    
    /**
     * Show the next target for the click test
     */
    function showNextTarget() {
        if (!clickTestActive) return;
        
        // Get test area dimensions
        const testAreaRect = clickTestArea.getBoundingClientRect();
        const maxX = testAreaRect.width - 80; // target width
        const maxY = testAreaRect.height - 80; // target height
        
        // Generate random position
        const targetX = Math.floor(Math.random() * maxX);
        const targetY = Math.floor(Math.random() * maxY);
        
        // Position and show target
        targetCircle.style.left = `${targetX}px`;
        targetCircle.style.top = `${targetY}px`;
        targetCircle.style.display = 'flex';
        targetCircle.style.backgroundColor = 'var(--warning-color)';
        targetCircle.textContent = Translator.translate('click') + '!';
        
        // Record start time
        clickStartTime = performance.now();
        
        // Store target position
        targetPositions.push({
            x: targetX + 40, // center of target
            y: targetY + 40,
            time: clickStartTime
        });
        
        // Set timeout for missed targets (3 seconds)
        clickTestInterval = setTimeout(() => {
            if (clickTestActive) {
                // Change color to indicate timeout
                targetCircle.style.backgroundColor = 'var(--danger-color)';
                targetCircle.textContent = Translator.translate('tooSlow');
                
                // Record missed target
                clickEvents.push({
                    time: 3000, // penalty time
                    hit: false,
                    missed: true,
                    position: { ...targetPositions[targetPositions.length - 1] }
                });
                
                // Update chart
                updateClickChart();
                
                // Show next target after delay
                setTimeout(() => {
                    if (clickTestActive) {
                        showNextTarget();
                    }
                }, 1000);
            }
        }, 3000);
    }
    
    /**
     * Handle click on the target
     * @param {MouseEvent} e - Click event
     */
    function handleTargetClick(e) {
        if (!clickTestActive || targetCircle.style.display === 'none') return;
        
        // Calculate reaction time
        const clickTime = performance.now();
        const reactionTime = clickTime - clickStartTime;
        
        // Check if click hit the target
        const targetRect = targetCircle.getBoundingClientRect();
        const hit = (
            e.clientX >= targetRect.left &&
            e.clientX <= targetRect.right &&
            e.clientY >= targetRect.top &&
            e.clientY <= targetRect.bottom
        );
        
        // Record click data
        clickEvents.push({
            time: reactionTime,
            hit: hit,
            missed: !hit,
            position: {
                x: e.clientX - clickTestArea.getBoundingClientRect().left,
                y: e.clientY - clickTestArea.getBoundingClientRect().top,
                time: clickTime
            }
        });
        
        // Update chart
        updateClickChart();
        
        // Handle hit or miss
        if (hit) {
            // Show success feedback
            targetCircle.style.backgroundColor = 'var(--success-color)';
            targetCircle.textContent = `${reactionTime.toFixed(0)} ms`;
            
            // Clear timeout
            if (clickTestInterval) {
                clearTimeout(clickTestInterval);
                clickTestInterval = null;
            }
            
            // Check if we should end the test
            setTimeout(() => {
                if (clickTestActive) {
                    if (clickEvents.filter(e => e.hit).length >= 10) {
                        // End test after 10 successful hits
                        stopClickTest();
                    } else {
                        // Show next target
                        showNextTarget();
                    }
                }
            }, 1000);
        } else {
            // Show miss feedback
            targetCircle.style.backgroundColor = 'var(--danger-color)';
            targetCircle.textContent = Translator.translate('missed');
        }
    }
    
    /**
     * Update click test chart
     */
    function updateClickChart() {
        if (!clickChart) return;
        
        // Prepare data for chart
        const hitData = clickEvents
            .filter(event => event.hit)
            .map((event, index) => ({
                x: clickEvents.indexOf(event) + 1,
                y: event.time
            }));
            
        const missData = clickEvents
            .filter(event => event.missed)
            .map((event) => ({
                x: clickEvents.indexOf(event) + 1,
                y: event.time
            }));
        
        // Update chart datasets
        clickChart.data.datasets = [
            {
                label: Translator.translate('hits'),
                data: hitData,
                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                borderColor: 'rgb(46, 204, 113)',
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: Translator.translate('misses'),
                data: missData,
                backgroundColor: 'rgba(255, 71, 87, 0.6)',
                borderColor: 'rgb(255, 71, 87)',
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ];
        
        clickChart.update();
    }
    
    /**
     * Analyze mouse test results
     */
    function analyzeMouseResults() {
        if (mouseEvents.length < 10) {
            document.getElementById('mouse-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreMouseData')}</p>
            `;
            return;
        }
        
        // Calculate delays between events
        let delays = [];
        for (let i = 1; i < mouseEvents.length; i++) {
            delays.push(mouseEvents[i].time - mouseEvents[i-1].time);
        }
        
        // Calculate speeds
        const speeds = [];
        for (let i = 1; i < mouseEvents.length; i++) {
            speeds.push(mouseEvents[i].speed);
        }
        
        // Filter outliers if enabled
        if (document.getElementById('filter-outliers').checked) {
            delays = StatsAnalyzer.filterOutliers(delays);
        }
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            delays = StatsAnalyzer.applyNoiseReduction(delays, noiseReductionMethod);
        }
        
        // Calculate statistics
        const avgDelay = StatsAnalyzer.calculateAverage(delays);
        const minDelay = StatsAnalyzer.calculateMin(delays);
        const maxDelay = StatsAnalyzer.calculateMax(delays);
        const p95Delay = StatsAnalyzer.calculatePercentile(delays, 0.95);
        const stdDev = StatsAnalyzer.calculateStandardDeviation(delays);
        const avgSpeed = StatsAnalyzer.calculateAverage(speeds);
        
        // Estimate polling rate
        let estimatedPollingRate = 1000 / avgDelay;
        
        // Round to standard polling rates
        const standardRates = [125, 250, 500, 1000, 2000, 4000, 8000];
        let closestRate = standardRates.reduce((prev, curr) => 
            Math.abs(curr - estimatedPollingRate) < Math.abs(prev - estimatedPollingRate) ? curr : prev
        );
        
        // Store results in global test results
        window.gamePerformanceAnalyzer.testResults.mouse = {
            avgDelay: avgDelay,
            minDelay: minDelay,
            maxDelay: maxDelay,
            p95Delay: p95Delay,
            stdDev: stdDev,
            estimatedPollingRate: closestRate,
            sampleCount: delays.length
        };
        
        // Get ratings
        const avgDelayRating = StatsAnalyzer.rateMetric(avgDelay, 2, 5, 10, 15);
        const pollingRateRating = StatsAnalyzer.rateMetric(closestRate, 1000, 500, 250, 125, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('mouseTestResults')}</h3>
            <div class="chart-container">
                <canvas id="mouse-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageLatency')}</td>
                    <td>${avgDelay.toFixed(2)} ms</td>
                    <td><span class="rating ${avgDelayRating.ratingClass}">${Translator.translate(avgDelayRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumLatency')}</td>
                    <td>${minDelay.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumLatency')}</td>
                    <td>${maxDelay.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('95thPercentile')}</td>
                    <td>${p95Delay.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('standardDeviation')}</td>
                    <td>${stdDev.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('estimatedPollingRate')}</td>
                    <td>${closestRate} Hz</td>
                    <td><span class="rating ${pollingRateRating.ratingClass}">${Translator.translate(pollingRateRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('sampleCount')}</td>
                    <td>${delays.length}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('mouseInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const consistency = 100 - (stdDev / avgDelay * 100); // consistency %
            const smoothnessIndex = Math.max(0, 100 - (p95Delay - avgDelay) / avgDelay * 50); // smoothness index
            
            const consistencyRating = StatsAnalyzer.rateMetric(consistency, 95, 90, 80, 70, true);
            const smoothnessRating = StatsAnalyzer.rateMetric(smoothnessIndex, 95, 90, 80, 70, true);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('movementConsistency')}</td>
                    <td>${consistency.toFixed(2)}%</td>
                    <td><span class="rating ${consistencyRating.ratingClass}">${Translator.translate(consistencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('movementSmoothness')}</td>
                    <td>${smoothnessIndex.toFixed(2)}%</td>
                    <td><span class="rating ${smoothnessRating.ratingClass}">${Translator.translate(smoothnessRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('averageMovementSpeed')}</td>
                    <td>${avgSpeed.toFixed(2)} px/frame</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('mouseTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                const histogram = StatsAnalyzer.createHistogram(delays, 10);
                
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <p>${Translator.translate('latencyDistribution')}:</p>
                <div class="debug-chart-container">
                    <canvas id="mouse-histogram-chart"></canvas>
                </div>
                <p>${Translator.translate('first10Values')}:</p>
                <pre>${JSON.stringify(delays.slice(0, 10).map(d => d.toFixed(2)), null, 2)}</pre>
                `;
            }
        }
        
        // Update results container
        document.getElementById('mouse-results').innerHTML = html;
        
        // Create results chart
        const ctx = document.getElementById('mouse-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: delays.length}, (_, i) => i + 1).slice(-100),
                datasets: [{
                    label: Translator.translate('mouseLatency') + ' (ms)',
                    data: delays.slice(-100),
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderWidth: 2,
                    tension: 0.2,
                    pointRadius: 3
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
                            text: Translator.translate('sampleNumber')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: Translator.translate('latencyMs')
                        }
                    }
                }
            }
        });
        
        // Create histogram chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            const histogram = StatsAnalyzer.createHistogram(delays, 10);
            
            const histCtx = document.getElementById('mouse-histogram-chart').getContext('2d');
            new Chart(histCtx, {
                type: 'bar',
                data: {
                    labels: histogram.binEdges.slice(0, -1).map((v, i) => 
                        `${v.toFixed(1)}-${histogram.binEdges[i+1].toFixed(1)} ms`),
                    datasets: [{
                        label: Translator.translate('frequency'),
                        data: histogram.frequencies,
                        backgroundColor: 'rgba(93, 63, 211, 0.6)',
                        borderColor: 'rgb(93, 63, 211)',
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
                                text: Translator.translate('latencyRange')
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
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Analyze click test results
     */
    function analyzeClickResults() {
        if (clickEvents.length < 3) {
            document.getElementById('click-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreClickData')}</p>
            `;
            return;
        }
        
        // Analyze hit targets only
        const hitTimes = clickEvents.filter(event => event.hit).map(event => event.time);
        const missCount = clickEvents.filter(event => event.missed).length;
        const accuracy = (hitTimes.length / clickEvents.length) * 100;
        
        // Filter outliers if enabled
        let filteredTimes = hitTimes;
        if (document.getElementById('filter-outliers').checked && hitTimes.length > 5) {
            filteredTimes = StatsAnalyzer.filterOutliers(hitTimes);
        }
        
        // Calculate statistics
        const avgReactionTime = StatsAnalyzer.calculateAverage(filteredTimes);
        const minReactionTime = StatsAnalyzer.calculateMin(filteredTimes);
        const maxReactionTime = StatsAnalyzer.calculateMax(filteredTimes);
        const stdDev = StatsAnalyzer.calculateStandardDeviation(filteredTimes);
        
        // Store results in global test results
        window.gamePerformanceAnalyzer.testResults.click = {
            avgReactionTime: avgReactionTime,
            minReactionTime: minReactionTime,
            maxReactionTime: maxReactionTime,
            stdDev: stdDev,
            accuracy: accuracy,
            sampleCount: clickEvents.length
        };
        
        // Get ratings
        const reactionTimeRating = StatsAnalyzer.rateMetric(avgReactionTime, 200, 250, 300, 350);
        const accuracyRating = StatsAnalyzer.rateMetric(accuracy, 95, 90, 80, 70, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('clickTestResults')}</h3>
            <div class="chart-container">
                <canvas id="click-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageReactionTime')}</td>
                    <td>${avgReactionTime.toFixed(2)} ms</td>
                    <td><span class="rating ${reactionTimeRating.ratingClass}">${Translator.translate(reactionTimeRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumReactionTime')}</td>
                    <td>${minReactionTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumReactionTime')}</td>
                    <td>${maxReactionTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('standardDeviation')}</td>
                    <td>${stdDev.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('accuracy')}</td>
                    <td>${accuracy.toFixed(2)}%</td>
                    <td><span class="rating ${accuracyRating.ratingClass}">${Translator.translate(accuracyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('attemptCount')}</td>
                    <td>${clickEvents.length}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('clickInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const p75ReactionTime = StatsAnalyzer.calculatePercentile(filteredTimes, 0.75);
            const consistency = 100 - (stdDev / avgReactionTime * 100); // consistency %
            
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
                    <td>${Translator.translate('75percentileReactionTime')}</td>
                    <td>${p75ReactionTime.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('reactionConsistency')}</td>
                    <td>${consistency.toFixed(2)}%</td>
                    <td><span class="rating ${consistencyRating.ratingClass}">${Translator.translate(consistencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('missCount')}</td>
                    <td>${missCount}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('clickTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                const histogram = StatsAnalyzer.createHistogram(filteredTimes, 8);
                
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <p>${Translator.translate('reactionTimeDistribution')}:</p>
                <div class="debug-chart-container">
                    <canvas id="click-histogram-chart"></canvas>
                </div>
                `;
            }
        }
        
        // Update results container
        document.getElementById('click-results').innerHTML = html;
        
        // Create results chart (scatter plot of all attempts)
        updateFinalClickChart();
        
        // Create histogram chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            const histogram = StatsAnalyzer.createHistogram(filteredTimes, 8);
            
            const histCtx = document.getElementById('click-histogram-chart').getContext('2d');
            new Chart(histCtx, {
                type: 'bar',
                data: {
                    labels: histogram.binEdges.slice(0, -1).map((v, i) => 
                        `${v.toFixed(0)}-${histogram.binEdges[i+1].toFixed(0)} ms`),
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
                                text: Translator.translate('reactionTimeRange')
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
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create final click test results chart
     */
    function updateFinalClickChart() {
        // Prepare data for chart
        const hitData = clickEvents
            .filter(event => event.hit)
            .map((event, index) => ({
                x: index + 1,
                y: event.time
            }));
            
        const missData = clickEvents
            .filter(event => event.missed)
            .map((event, index) => ({
                x: clickEvents.indexOf(event) + 1,
                y: event.time
            }));
        
        // Create chart
        const ctx = document.getElementById('click-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: Translator.translate('hits'),
                        data: hitData,
                        backgroundColor: 'rgba(46, 204, 113, 0.6)',
                        borderColor: 'rgb(46, 204, 113)',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: Translator.translate('misses'),
                        data: missData,
                        backgroundColor: 'rgba(255, 71, 87, 0.6)',
                        borderColor: 'rgb(255, 71, 87)',
                        pointRadius: 6,
                        pointHoverRadius: 8
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
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('attemptNumber')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: Translator.translate('reactionTimeMs')
                        },
                        min: 0,
                        suggestedMax: Math.max(500, ...clickEvents.map(e => e.time)) + 100
                    }
                }
            }
        });
    }
    
    // Public API
    return {
        startMouseTest,
        stopMouseTest,
        startClickTest,
        stopClickTest
    };
})();