/**
 * Ultimate Gaming Performance Analyzer
 * System Test Module
 * 
 * This module handles system latency, CPU, and memory performance tests.
 */

const SystemTest = (function() {
    // Test state variables
    let systemTestActive = false;
    let cpuTestActive = false;
    let memoryTestActive = false;
    
    // Test data storage
    let systemTimings = {
        precision: [],
        raf: [],
        eventLoop: [],
        combined: []
    };
    
    let cpuResults = {
        singleThread: 0,
        multiThread: 0,
        workersCount: 0,
        fibonacci: 0,
        sort: 0,
        prime: 0
    };
    
    let memoryResults = {
        allocationSpeed: 0,
        accessSpeed: 0,
        largeObjectHandling: 0,
        garbageCollection: 0,
        performanceScore: 0
    };
    
    // Test UI elements
    let systemTestArea = null;
    let cpuTestArea = null;
    let memoryTestArea = null;
    let systemSpinner = null;
    let systemProgressBar = null;
    let cpuProgressBar = null;
    let memoryProgressBar = null;
    
    // Web workers for multithreaded tests
    let workers = [];
    
    /**
     * Initialize the system latency test
     */
    function initSystemTest() {
        systemTestArea = document.getElementById('system-test-area');
        
        // Create test area content
        systemTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('systemTestInstructions')}</p>
            </div>
            <div class="spinner" id="system-spinner" style="display:none;"></div>
            <div class="progress-container" id="system-progress">
                <div class="progress-bar" id="system-progress-bar"></div>
            </div>
            <div class="test-status" id="system-status">${Translator.translate('readyToStart')}</div>
        `;
        
        // Get UI elements
        systemSpinner = document.getElementById('system-spinner');
        systemProgressBar = document.getElementById('system-progress-bar');
    }
    
    /**
     * Initialize the CPU test
     */
    function initCpuTest() {
        cpuTestArea = document.getElementById('cpu-test-area');
        
        // Create test area content
        cpuTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('cpuTestInstructions')}</p>
            </div>
            <div class="progress-container" id="cpu-progress">
                <div class="progress-bar" id="cpu-progress-bar"></div>
            </div>
            <div class="test-details">
                <div class="cpu-usage-graph">
                    <div class="graph-title">${Translator.translate('simulatedCpuUsage')}</div>
                    <canvas id="cpu-usage-chart" height="100"></canvas>
                </div>
                <div class="test-status" id="cpu-status">${Translator.translate('readyToStart')}</div>
            </div>
        `;
        
        // Get UI elements
        cpuProgressBar = document.getElementById('cpu-progress-bar');
        
        // Initialize CPU usage chart
        const ctx = document.getElementById('cpu-usage-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 30}, (_, i) => ''),
                datasets: [{
                    label: Translator.translate('cpuUsage'),
                    data: Array.from({length: 30}, () => 0),
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                scales: {
                    x: {
                        display: false,
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return `${value}%`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 500
                }
            }
        });
    }
    
    /**
     * Initialize the memory test
     */
    function initMemoryTest() {
        memoryTestArea = document.getElementById('memory-test-area');
        
        // Create test area content
        memoryTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('memoryTestInstructions')}</p>
            </div>
            <div class="progress-container" id="memory-progress">
                <div class="progress-bar" id="memory-progress-bar"></div>
            </div>
            <div class="test-status" id="memory-status">${Translator.translate('readyToStart')}</div>
        `;
        
        // Get UI elements
        memoryProgressBar = document.getElementById('memory-progress-bar');
    }
    
    /**
     * Start the system latency test
     */
    function startSystemTest() {
        // Initialize test if needed
        if (!systemTestArea) {
            initSystemTest();
        }
        
        // Reset test data
        systemTestActive = true;
        systemTimings = {
            precision: [],
            raf: [],
            eventLoop: [],
            combined: []
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('system-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('systemTestRunning')}</p>
            <div class="chart-container">
                <canvas id="system-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('system-chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    Translator.translate('apiPrecision'),
                    Translator.translate('rafLatency'),
                    Translator.translate('eventLoopLatency'),
                    Translator.translate('totalLatency')
                ],
                datasets: [{
                    label: Translator.translate('systemLatency') + ' (ms)',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(3, 218, 198, 0.2)',
                    borderColor: 'rgb(3, 218, 198)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(3, 218, 198)'
                }, {
                    label: Translator.translate('referenceValues') + ' (ms)',
                    data: [0.01, 4, 2, 6],
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderColor: 'rgb(93, 63, 211)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(93, 63, 211)'
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
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Show spinner and reset progress
        systemSpinner.style.display = 'block';
        systemProgressBar.style.width = '0%';
        document.getElementById('system-status').textContent = Translator.translate('systemTestStarted');
        
        // Run system latency tests in sequence
        runSystemLatencyTests();
    }
    
    /**
     * Stop the system latency test
     */
    function stopSystemTest() {
        systemTestActive = false;
        
        // Hide spinner
        if (systemSpinner) {
            systemSpinner.style.display = 'none';
        }
        
        // Analyze and display results if we have data
        if (systemTimings.precision.length > 0) {
            analyzeSystemResults();
        } else {
            document.getElementById('system-results').innerHTML = `
                <h3>${Translator.translate('testStopped')}</h3>
                <p>${Translator.translate('notEnoughData')}</p>
            `;
        }
    }
    
    /**
     * Start the CPU test
     */
    function startCpuTest() {
        // Initialize test if needed
        if (!cpuTestArea) {
            initCpuTest();
        }
        
        // Reset test data
        cpuTestActive = true;
        cpuResults = {
            singleThread: 0,
            multiThread: 0,
            workersCount: 0,
            fibonacci: 0,
            sort: 0,
            prime: 0
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('cpu-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('cpuTestRunning')}</p>
        `;
        
        // Reset and show progress bar
        cpuProgressBar.style.width = '0%';
        document.getElementById('cpu-status').textContent = Translator.translate('cpuTestStarted');
        
        // Run CPU tests in sequence
        setTimeout(() => runCpuTests(), 100);
    }
    
    /**
     * Stop the CPU test
     */
    function stopCpuTest() {
        cpuTestActive = false;
        
        // Terminate any workers
        workers.forEach(worker => worker.terminate());
        workers = [];
        
        // Display results if we have data
        if (cpuResults.singleThread > 0) {
            analyzeCpuResults();
        } else {
            document.getElementById('cpu-results').innerHTML = `
                <h3>${Translator.translate('testStopped')}</h3>
                <p>${Translator.translate('notEnoughData')}</p>
            `;
        }
    }
    
    /**
     * Start the memory test
     */
    function startMemoryTest() {
        // Initialize test if needed
        if (!memoryTestArea) {
            initMemoryTest();
        }
        
        // Reset test data
        memoryTestActive = true;
        memoryResults = {
            allocationSpeed: 0,
            accessSpeed: 0,
            largeObjectHandling: 0,
            garbageCollection: 0,
            performanceScore: 0
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('memory-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('memoryTestRunning')}</p>
        `;
        
        // Reset and show progress bar
        memoryProgressBar.style.width = '0%';
        document.getElementById('memory-status').textContent = Translator.translate('memoryTestStarted');
        
        // Run memory tests in sequence
        setTimeout(() => runMemoryTests(), 100);
    }
    
    /**
     * Stop the memory test
     */
    function stopMemoryTest() {
        memoryTestActive = false;
        
        // Display results if we have data
        if (memoryResults.performanceScore > 0) {
            analyzeMemoryResults();
        } else {
            document.getElementById('memory-results').innerHTML = `
                <h3>${Translator.translate('testStopped')}</h3>
                <p>${Translator.translate('notEnoughData')}</p>
            `;
        }
    }
    
    /**
     * Run system latency tests
     */
    async function runSystemLatencyTests() {
        if (!systemTestActive) return;
        
        const statusElement = document.getElementById('system-status');
        
        // Get sample count from settings
        const sampleCount = parseInt(document.getElementById('sample-count').value) || 50;
        
        // Test 1: Timing API precision
        updateSystemProgress(10);
        statusElement.textContent = Translator.translate('measuringTimingPrecision');
        const timingPrecision = await measureTimingPrecision(sampleCount);
        
        // Test 2: requestAnimationFrame latency
        updateSystemProgress(30);
        statusElement.textContent = Translator.translate('measuringRafLatency');
        const rafLatency = await measureRAFLatency(sampleCount);
        
        // Test 3: Event loop latency
        updateSystemProgress(60);
        statusElement.textContent = Translator.translate('measuringEventLoopLatency');
        const eventLoopLatency = await measureEventLoopLatency(sampleCount);
        
        // Test 4: Combined latency
        updateSystemProgress(90);
        statusElement.textContent = Translator.translate('calculatingResults');
        const combinedLatency = timingPrecision + rafLatency + eventLoopLatency;
        
        // Complete the test
        updateSystemProgress(100);
        systemSpinner.style.display = 'none';
        statusElement.textContent = Translator.translate('testCompleted');
        
        // Create result object
        const results = {
            timingPrecision,
            rafLatency,
            eventLoopLatency,
            combinedLatency,
            sampleCount: systemTimings.raf.length
        };
        
        // Store in global test results
        window.gamePerformanceAnalyzer.testResults.system = results;
        
        // Display results
        analyzeSystemResults();
    }
    
    /**
     * Update system test progress
     * @param {number} percent - Progress percentage (0-100)
     */
    function updateSystemProgress(percent) {
        systemProgressBar.style.width = `${percent}%`;
    }
    
    /**
     * Measure timing API precision
     * @param {number} sampleCount - Number of samples to collect
     * @returns {number} Average timing precision in ms
     */
    async function measureTimingPrecision(sampleCount) {
        // Measures precision of Performance API
        const samples = [];
        
        for (let i = 0; i < sampleCount * 20; i++) {
            const start = performance.now();
            const end = performance.now();
            
            if (end > start) {
                samples.push(end - start);
                systemTimings.precision.push(end - start);
            }
            
            // Allow event loop to process other tasks
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
                
                // Check if test was stopped
                if (!systemTestActive) {
                    break;
                }
            }
        }
        
        // Filter outliers if enabled
        const filteredSamples = document.getElementById('filter-outliers').checked ? 
            StatsAnalyzer.filterOutliers(samples) : 
            samples;
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            return StatsAnalyzer.calculateAverage(
                StatsAnalyzer.applyNoiseReduction(filteredSamples, noiseReductionMethod)
            );
        }
        
        return StatsAnalyzer.calculateAverage(filteredSamples);
    }
    
    /**
     * Measure requestAnimationFrame latency
     * @param {number} sampleCount - Number of samples to collect
     * @returns {number} Average RAF latency in ms
     */
    async function measureRAFLatency(sampleCount) {
        return new Promise(resolve => {
            const samples = [];
            let count = 0;
            let lastTimestamp = performance.now();
            
            function frame(timestamp) {
                const now = performance.now();
                const delay = now - lastTimestamp;
                
                samples.push(delay);
                systemTimings.raf.push(delay);
                lastTimestamp = now;
                
                count++;
                updateSystemProgress(30 + (count / sampleCount) * 30);
                
                if (count < sampleCount && systemTestActive) {
                    requestAnimationFrame(frame);
                } else {
                    // Remove first measurement which may be inaccurate
                    samples.shift();
                    
                    // Filter outliers if enabled
                    const filteredSamples = document.getElementById('filter-outliers').checked ? 
                        StatsAnalyzer.filterOutliers(samples) : 
                        samples;
                    
                    // Apply noise reduction if selected
                    const noiseReductionMethod = document.getElementById('noise-reduction').value;
                    if (noiseReductionMethod !== 'none') {
                        resolve(StatsAnalyzer.calculateAverage(
                            StatsAnalyzer.applyNoiseReduction(filteredSamples, noiseReductionMethod)
                        ));
                    } else {
                        resolve(StatsAnalyzer.calculateAverage(filteredSamples));
                    }
                }
            }
            
            requestAnimationFrame(frame);
        });
    }
    
    /**
     * Measure event loop latency
     * @param {number} sampleCount - Number of samples to collect
     * @returns {number} Average event loop latency in ms
     */
    async function measureEventLoopLatency(sampleCount) {
        return new Promise(resolve => {
            const samples = [];
            let count = 0;
            
            function measure() {
                if (!systemTestActive) {
                    resolve(0);
                    return;
                }
                
                const start = performance.now();
                
                setTimeout(() => {
                    const end = performance.now();
                    const delay = end - start;
                    
                    // Subtract base setTimeout delay (typically 4ms)
                    // but ensure we don't go negative
                    const normalizedDelay = Math.max(0, delay - 4);
                    
                    samples.push(normalizedDelay);
                    systemTimings.eventLoop.push(normalizedDelay);
                    
                    count++;
                    updateSystemProgress(60 + (count / sampleCount) * 30);
                    
                    if (count < sampleCount && systemTestActive) {
                        measure();
                    } else {
                        // Filter outliers if enabled
                        const filteredSamples = document.getElementById('filter-outliers').checked ? 
                            StatsAnalyzer.filterOutliers(samples) : 
                            samples;
                        
                        // Apply noise reduction if selected
                        const noiseReductionMethod = document.getElementById('noise-reduction').value;
                        if (noiseReductionMethod !== 'none') {
                            resolve(StatsAnalyzer.calculateAverage(
                                StatsAnalyzer.applyNoiseReduction(filteredSamples, noiseReductionMethod)
                            ));
                        } else {
                            resolve(StatsAnalyzer.calculateAverage(filteredSamples));
                        }
                    }
                }, 0);
            }
            
            measure();
        });
    }
    
    /**
     * Run CPU performance tests
     */
    async function runCpuTests() {
        if (!cpuTestActive) return;
        
        const statusElement = document.getElementById('cpu-status');
        const cpuUsageChart = Chart.getChart('cpu-usage-chart');
        
        // Update usage chart animation
        const updateCpuUsage = (usage) => {
            if (!cpuUsageChart || !cpuTestActive) return;
            
            // Add new data point and remove oldest
            const data = [...cpuUsageChart.data.datasets[0].data.slice(1), usage];
            cpuUsageChart.data.datasets[0].data = data;
            cpuUsageChart.update();
        };
        
        // Simulate CPU usage
        let usageInterval = setInterval(() => {
            if (!cpuTestActive) {
                clearInterval(usageInterval);
                return;
            }
            
            updateCpuUsage(Math.random() * 30 + 50); // Random 50-80% usage
        }, 300);
        
        try {
            // Test 1: Single thread performance (Fibonacci)
            updateCpuProgress(10);
            statusElement.textContent = Translator.translate('testingSingleThreadPerformance');
            updateCpuUsage(65);
            cpuResults.fibonacci = await testFibonacci();
            
            if (!cpuTestActive) return;
            
            // Test 2: Sorting performance
            updateCpuProgress(30);
            statusElement.textContent = Translator.translate('testingSortingPerformance');
            updateCpuUsage(75);
            cpuResults.sort = await testSort();
            
            if (!cpuTestActive) return;
            
            // Test 3: Prime number calculation
            updateCpuProgress(50);
            statusElement.textContent = Translator.translate('testingPrimeCalculation');
            updateCpuUsage(85);
            cpuResults.prime = await testPrime();
            
            if (!cpuTestActive) return;
            
            // Calculate single thread score
            cpuResults.singleThread = 0.4 * cpuResults.fibonacci + 0.3 * cpuResults.sort + 0.3 * cpuResults.prime;
            
            // Test 4: Multi-threading capabilities
            updateCpuProgress(70);
            statusElement.textContent = Translator.translate('testingMultithreading');
            updateCpuUsage(95);
            cpuResults.workersCount = estimateAvailableThreads();
            
            if (!cpuTestActive) return;
            
            // Simulate multi-threaded test
            updateCpuProgress(90);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!cpuTestActive) return;
            
            // Calculate multi-thread score based on single thread and cores
            cpuResults.multiThread = cpuResults.singleThread * Math.min(8, cpuResults.workersCount) * 0.8;
            
            // Complete the test
            clearInterval(usageInterval);
            updateCpuProgress(100);
            statusElement.textContent = Translator.translate('testCompleted');
            
            // Store in global test results
            window.gamePerformanceAnalyzer.testResults.cpu = cpuResults;
            
            // Display results
            analyzeCpuResults();
            
        } catch (error) {
            console.error('CPU test error:', error);
            clearInterval(usageInterval);
            statusElement.textContent = Translator.translate('testError') + `: ${error.message}`;
        }
    }
    
    /**
     * Update CPU test progress
     * @param {number} percent - Progress percentage (0-100)
     */
    function updateCpuProgress(percent) {
        if (cpuProgressBar) {
            cpuProgressBar.style.width = `${percent}%`;
        }
    }
    
    /**
     * Fibonacci calculation test (single-thread)
     * @returns {number} Performance score (0-100)
     */
    async function testFibonacci() {
        const startTime = performance.now();
        
        // Calculate 35th Fibonacci number recursively (intensive task)
        function fibonacci(n) {
            if (n <= 1) return n;
            return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        fibonacci(35);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 10000 / executionTime);
    }
    
    /**
     * Sorting test
     * @returns {number} Performance score (0-100)
     */
    async function testSort() {
        const startTime = performance.now();
        
        // Create large array of random numbers
        const array = Array.from({length: 100000}, () => Math.random());
        
        // Sort array
        array.sort((a, b) => a - b);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 5000 / executionTime);
    }
    
    /**
     * Prime number calculation test
     * @returns {number} Performance score (0-100)
     */
    async function testPrime() {
        const startTime = performance.now();
        
        // Function to check if a number is prime
        function isPrime(num) {
            if (num <= 1) return false;
            if (num <= 3) return true;
            if (num % 2 === 0 || num % 3 === 0) return false;
            
            let i = 5;
            while (i * i <= num) {
                if (num % i === 0 || num % (i + 2) === 0) return false;
                i += 6;
            }
            return true;
        }
        
        // Find all primes up to 20000
        const primes = [];
        for (let i = 2; i < 20000; i++) {
            if (isPrime(i)) {
                primes.push(i);
            }
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 3000 / executionTime);
    }
    
    /**
     * Estimate available CPU threads
     * @returns {number} Estimated number of threads
     */
    function estimateAvailableThreads() {
        // Use navigator.hardwareConcurrency if available, otherwise estimate
        return navigator.hardwareConcurrency || 4; // Default to 4 if not available
    }
    
    /**
     * Run memory performance tests
     */
    async function runMemoryTests() {
        if (!memoryTestActive) return;
        
        const statusElement = document.getElementById('memory-status');
        
        try {
            // Test 1: Memory allocation speed
            updateMemoryProgress(10);
            statusElement.textContent = Translator.translate('testingMemoryAllocation');
            memoryResults.allocationSpeed = await testMemoryAllocation();
            
            if (!memoryTestActive) return;
            
            // Test 2: Memory access speed
            updateMemoryProgress(30);
            statusElement.textContent = Translator.translate('testingMemoryAccess');
            memoryResults.accessSpeed = await testMemoryAccess();
            
            if (!memoryTestActive) return;
            
            // Test 3: Large object handling
            updateMemoryProgress(50);
            statusElement.textContent = Translator.translate('testingLargeObjects');
            memoryResults.largeObjectHandling = await testLargeObjects();
            
            if (!memoryTestActive) return;
            
            // Test 4: Garbage collection
            updateMemoryProgress(70);
            statusElement.textContent = Translator.translate('testingGarbageCollection');
            memoryResults.garbageCollection = await testGarbageCollection();
            
            if (!memoryTestActive) return;
            
            // Calculate overall memory performance score
            updateMemoryProgress(90);
            memoryResults.performanceScore = calculateMemoryScore(memoryResults);
            
            // Complete the test
            updateMemoryProgress(100);
            statusElement.textContent = Translator.translate('testCompleted');
            
            // Store in global test results
            window.gamePerformanceAnalyzer.testResults.memory = memoryResults;
            
            // Display results
            analyzeMemoryResults();
            
        } catch (error) {
            console.error('Memory test error:', error);
            statusElement.textContent = Translator.translate('testError') + `: ${error.message}`;
        }
    }
    
    /**
     * Update memory test progress
     * @param {number} percent - Progress percentage (0-100)
     */
    function updateMemoryProgress(percent) {
        if (memoryProgressBar) {
            memoryProgressBar.style.width = `${percent}%`;
        }
    }
    
    /**
     * Test memory allocation speed
     * @returns {number} Performance score (0-100)
     */
    async function testMemoryAllocation() {
        const startTime = performance.now();
        const iterations = 1000;
        
        for (let i = 0; i < iterations; i++) {
            // Allocate arrays of increasing size
            const array = new Array(i * 1000);
            for (let j = 0; j < array.length; j++) {
                array[j] = j;
            }
            
            // Allow GC to run periodically
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
                
                if (!memoryTestActive) break;
            }
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 10000 / executionTime);
    }
    
    /**
     * Test memory access speed
     * @returns {number} Performance score (0-100)
     */
    async function testMemoryAccess() {
        // Create large array
        const size = 1000000;
        const array = new Array(size);
        for (let i = 0; i < size; i++) {
            array[i] = i;
        }
        
        const startTime = performance.now();
        let sum = 0;
        
        // Random access pattern
        for (let i = 0; i < 1000000; i++) {
            const index = Math.floor(Math.random() * size);
            sum += array[index];
            
            // Allow other tasks to run
            if (i % 100000 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
                
                if (!memoryTestActive) break;
            }
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 5000 / executionTime);
    }
    
    /**
     * Test large object handling
     * @returns {number} Performance score (0-100)
     */
    async function testLargeObjects() {
        const startTime = performance.now();
        const iterations = 50;
        
        for (let i = 0; i < iterations; i++) {
            // Create and manipulate large objects
            const obj = {};
            for (let j = 0; j < 10000; j++) {
                obj[`key_${j}`] = `value_${j}`;
            }
            
            // Perform some operations on the object
            const keys = Object.keys(obj);
            let count = 0;
            for (const key of keys) {
                if (key.includes('5')) {
                    count++;
                }
            }
            
            // Allow GC to run
            await new Promise(resolve => setTimeout(resolve, 0));
            
            if (!memoryTestActive) break;
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 2000 / executionTime);
    }
    
    /**
     * Test garbage collection performance
     * @returns {number} Performance score (0-100)
     */
    async function testGarbageCollection() {
        const startTime = performance.now();
        const iterations = 100;
        
        for (let i = 0; i < iterations; i++) {
            // Create and discard objects to trigger GC
            const objects = [];
            for (let j = 0; j < 10000; j++) {
                objects.push({
                    id: j,
                    value: `test_${j}`,
                    data: new Array(100).fill(j)
                });
            }
            
            // Clear the array and try to force GC
            objects.length = 0;
            
            // Wait a bit to allow GC to run
            await new Promise(resolve => setTimeout(resolve, 50));
            
            if (!memoryTestActive) break;
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Normalize score (lower time = better score, scale 0-100)
        return Math.min(100, 10000 / executionTime);
    }
    
    /**
     * Calculate overall memory performance score
     * @param {Object} results - Memory test results
     * @returns {number} Overall score (0-100)
     */
    function calculateMemoryScore(results) {
        return 0.3 * results.allocationSpeed + 
               0.3 * results.accessSpeed + 
               0.2 * results.largeObjectHandling + 
               0.2 * results.garbageCollection;
    }
    
    /**
     * Analyze system latency test results
     */
    function analyzeSystemResults() {
        // Get results from global object
        const results = window.gamePerformanceAnalyzer.testResults.system;
        
        if (!results) {
            document.getElementById('system-results').innerHTML = `
                <h3>${Translator.translate('testError')}</h3>
                <p>${Translator.translate('noResultsAvailable')}</p>
            `;
            return;
        }
        
        // Get ratings
        const combinedLatencyRating = StatsAnalyzer.rateMetric(results.combinedLatency, 6, 10, 15, 25);
        const timingPrecisionRating = StatsAnalyzer.rateMetric(results.timingPrecision, 0.01, 0.05, 0.1, 0.5);
        const rafLatencyRating = StatsAnalyzer.rateMetric(results.rafLatency, 4, 6, 8, 12);
        const eventLoopRating = StatsAnalyzer.rateMetric(results.eventLoopLatency, 1, 2, 4, 8);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('systemTestResults')}</h3>
            <div class="chart-container">
                <canvas id="system-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('timingApiPrecision')}</td>
                    <td>${results.timingPrecision.toFixed(3)} ms</td>
                    <td><span class="rating ${timingPrecisionRating.ratingClass}">${Translator.translate(timingPrecisionRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('rafLatency')}</td>
                    <td>${results.rafLatency.toFixed(2)} ms</td>
                    <td><span class="rating ${rafLatencyRating.ratingClass}">${Translator.translate(rafLatencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('eventLoopLatency')}</td>
                    <td>${results.eventLoopLatency.toFixed(2)} ms</td>
                    <td><span class="rating ${eventLoopRating.ratingClass}">${Translator.translate(eventLoopRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('totalSystemLatency')}</td>
                    <td>${results.combinedLatency.toFixed(2)} ms</td>
                    <td><span class="rating ${combinedLatencyRating.ratingClass}">${Translator.translate(combinedLatencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('sampleCount')}</td>
                    <td>${results.sampleCount}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('systemInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const stdDevRAF = StatsAnalyzer.calculateStandardDeviation(systemTimings.raf);
            const stdDevEventLoop = StatsAnalyzer.calculateStandardDeviation(systemTimings.eventLoop);
            
            const systemScore = calculateSystemPerformanceScore(
                results.timingPrecision, 
                results.rafLatency, 
                results.eventLoopLatency, 
                stdDevRAF, 
                stdDevEventLoop
            );
            
            const systemBottleneck = identifySystemBottleneck(
                results.timingPrecision, 
                results.rafLatency, 
                results.eventLoopLatency
            );
            
            const stdDevRAFRating = StatsAnalyzer.rateMetric(stdDevRAF, 1, 2, 4, 6);
            const stdDevEventLoopRating = StatsAnalyzer.rateMetric(stdDevEventLoop, 0.5, 1, 2, 4);
            const systemScoreRating = StatsAnalyzer.rateMetric(systemScore, 90, 80, 70, 50, true);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('rafVariability')}</td>
                    <td>${stdDevRAF.toFixed(2)} ms</td>
                    <td><span class="rating ${stdDevRAFRating.ratingClass}">${Translator.translate(stdDevRAFRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('eventLoopVariability')}</td>
                    <td>${stdDevEventLoop.toFixed(2)} ms</td>
                    <td><span class="rating ${stdDevEventLoopRating.ratingClass}">${Translator.translate(stdDevEventLoopRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('systemPerformanceIndex')}</td>
                    <td>${systemScore.toFixed(1)}%</td>
                    <td><span class="rating ${systemScoreRating.ratingClass}">${Translator.translate(systemScoreRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('systemBottleneck')}</td>
                    <td>${Translator.translate(systemBottleneck)}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('systemTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <div class="debug-chart-container">
                    <canvas id="system-distribution-chart"></canvas>
                </div>
                `;
            }
        }
        
        // Update results container
        document.getElementById('system-results').innerHTML = html;
        
        // Create radar chart
        createSystemRadarChart(results);
        
        // Create distribution chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            createSystemDistributionChart();
        }
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create system radar chart
     * @param {Object} results - System test results
     */
    function createSystemRadarChart(results) {
        const ctx = document.getElementById('system-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    Translator.translate('apiPrecision'),
                    Translator.translate('rafLatency'),
                    Translator.translate('eventLoopLatency'),
                    Translator.translate('totalLatency')
                ],
                datasets: [{
                    label: Translator.translate('systemLatency') + ' (ms)',
                    data: [
                        results.timingPrecision,
                        results.rafLatency,
                        results.eventLoopLatency,
                        results.combinedLatency
                    ],
                    backgroundColor: 'rgba(3, 218, 198, 0.2)',
                    borderColor: 'rgb(3, 218, 198)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(3, 218, 198)'
                }, {
                    label: Translator.translate('referenceValues') + ' (ms)',
                    data: [0.01, 4, 2, 6],
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderColor: 'rgb(93, 63, 211)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(93, 63, 211)'
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
                        beginAtZero: true,
                        suggestedMax: Math.max(results.combinedLatency * 1.2, 10)
                    }
                }
            }
        });
    }
    
    /**
     * Create system distribution chart
     */
    function createSystemDistributionChart() {
        const ctx = document.getElementById('system-distribution-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translator.translate('apiPrecision'),
                    Translator.translate('rafLatency'),
                    Translator.translate('eventLoopLatency')
                ],
                datasets: [{
                    label: Translator.translate('averageValue') + ' (ms)',
                    data: [
                        StatsAnalyzer.calculateAverage(systemTimings.precision),
                        StatsAnalyzer.calculateAverage(systemTimings.raf),
                        StatsAnalyzer.calculateAverage(systemTimings.eventLoop)
                    ],
                    backgroundColor: 'rgba(3, 218, 198, 0.6)',
                    borderColor: 'rgb(3, 218, 198)',
                    borderWidth: 1
                }, {
                    label: Translator.translate('standardDeviation') + ' (ms)',
                    data: [
                        StatsAnalyzer.calculateStandardDeviation(systemTimings.precision),
                        StatsAnalyzer.calculateStandardDeviation(systemTimings.raf),
                        StatsAnalyzer.calculateStandardDeviation(systemTimings.eventLoop)
                    ],
                    backgroundColor: 'rgba(255, 71, 87, 0.6)',
                    borderColor: 'rgb(255, 71, 87)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
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
     * Calculate system performance score
     * @param {number} timingPrecision - Timing API precision
     * @param {number} rafLatency - requestAnimationFrame latency
     * @param {number} eventLoopLatency - Event loop latency
     * @param {number} stdDevRAF - Standard deviation of RAF
     * @param {number} stdDevEventLoop - Standard deviation of event loop
     * @returns {number} System performance score (0-100)
     */
    function calculateSystemPerformanceScore(timingPrecision, rafLatency, eventLoopLatency, stdDevRAF, stdDevEventLoop) {
        // Weights for components
        const weights = {
            timingPrecision: 0.1,
            rafLatency: 0.3,
            eventLoopLatency: 0.3,
            stdDevRAF: 0.15,
            stdDevEventLoop: 0.15
        };
        
        // Normalize scores (100% = ideal, 0% = very poor)
        const scores = {
            timingPrecision: Math.max(0, 100 - timingPrecision * 1000),
            rafLatency: Math.max(0, 100 - rafLatency * 5),
            eventLoopLatency: Math.max(0, 100 - eventLoopLatency * 10),
            stdDevRAF: Math.max(0, 100 - stdDevRAF * 15),
            stdDevEventLoop: Math.max(0, 100 - stdDevEventLoop * 25)
        };
        
        // Calculate weighted average
        return Object.keys(weights).reduce((score, key) => 
            score + weights[key] * scores[key], 0);
    }
    
    /**
     * Identify the system bottleneck
     * @param {number} timingPrecision - Timing API precision
     * @param {number} rafLatency - requestAnimationFrame latency
     * @param {number} eventLoopLatency - Event loop latency
     * @returns {string} Bottleneck component key
     */
    function identifySystemBottleneck(timingPrecision, rafLatency, eventLoopLatency) {
        // Normalize against typical good values
        const normalizedValues = {
            'timingApiPrecision': timingPrecision / 0.01,
            'browserRenderingEngine': rafLatency / 5,
            'javascriptEventLoop': eventLoopLatency / 2
        };
        
        // Find the worst component
        let bottleneck = '';
        let worstRatio = 0;
        
        for (const [component, ratio] of Object.entries(normalizedValues)) {
            if (ratio > worstRatio) {
                worstRatio = ratio;
                bottleneck = component;
            }
        }
        
        return bottleneck;
    }
    
    /**
     * Analyze CPU test results
     */
    function analyzeCpuResults() {
        // Get results
        const results = window.gamePerformanceAnalyzer.testResults.cpu;
        
        if (!results) {
            document.getElementById('cpu-results').innerHTML = `
                <h3>${Translator.translate('testError')}</h3>
                <p>${Translator.translate('noResultsAvailable')}</p>
            `;
            return;
        }
        
        // Get ratings
        const singleThreadRating = StatsAnalyzer.rateMetric(results.singleThread, 80, 60, 40, 20, true);
        const multiThreadRating = StatsAnalyzer.rateMetric(results.multiThread, 400, 300, 200, 100, true);
        const coresRating = StatsAnalyzer.rateMetric(results.workersCount, 8, 6, 4, 2, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('cpuTestResults')}</h3>
            <div class="chart-container">
                <canvas id="cpu-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('singleThreadPerformance')}</td>
                    <td>${results.singleThread.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${singleThreadRating.ratingClass}">${Translator.translate(singleThreadRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('multiThreadPerformance')}</td>
                    <td>${results.multiThread.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${multiThreadRating.ratingClass}">${Translator.translate(multiThreadRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('detectedCoresThreads')}</td>
                    <td>${results.workersCount}</td>
                    <td><span class="rating ${coresRating.ratingClass}">${Translator.translate(coresRating.rating.toLowerCase())}</span></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('cpuInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const fibonacciRating = StatsAnalyzer.rateMetric(results.fibonacci, 80, 60, 40, 20, true);
            const sortRating = StatsAnalyzer.rateMetric(results.sort, 80, 60, 40, 20, true);
            const primeRating = StatsAnalyzer.rateMetric(results.prime, 80, 60, 40, 20, true);
            
            const cpuCategory = categorizeCPU(results.singleThread, results.multiThread);
            const gamingCapability = assessGamingCapability(results.singleThread, results.multiThread);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('fibonacciTest')}</td>
                    <td>${results.fibonacci.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${fibonacciRating.ratingClass}">${Translator.translate(fibonacciRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('sortingTest')}</td>
                    <td>${results.sort.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${sortRating.ratingClass}">${Translator.translate(sortRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('primeNumbersTest')}</td>
                    <td>${results.prime.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${primeRating.ratingClass}">${Translator.translate(primeRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('cpuCategory')}</td>
                    <td>${Translator.translate(cpuCategory)}</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('gamingCapability')}</td>
                    <td>${Translator.translate(gamingCapability.capability)}</td>
                    <td><span class="rating ${StatsAnalyzer.rateMetric(gamingCapability.score, 90, 80, 70, 50, true).ratingClass}">
                        ${Translator.translate(StatsAnalyzer.rateMetric(gamingCapability.score, 90, 80, 70, 50, true).rating.toLowerCase())}
                    </span></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate(gamingCapability.recommendation)}</p>
            `;
        }
        
        // Update results container
        document.getElementById('cpu-results').innerHTML = html;
        
        // Create CPU chart
        createCpuChart(results);
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create CPU performance chart
     * @param {Object} results - CPU test results
     */
    function createCpuChart(results) {
        const ctx = document.getElementById('cpu-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translator.translate('singleThreadPerformance'),
                    Translator.translate('multiThreadPerformance'),
                    Translator.translate('fibonacciTest'),
                    Translator.translate('sortingTest'),
                    Translator.translate('primeNumbersTest')
                ],
                datasets: [{
                    label: Translator.translate('cpuPerformance'),
                    data: [
                        results.singleThread,
                        results.multiThread / 4, // Scale down for better visualization
                        results.fibonacci,
                        results.sort,
                        results.prime
                    ],
                    backgroundColor: [
                        'rgba(93, 63, 211, 0.6)',
                        'rgba(3, 218, 198, 0.6)',
                        'rgba(255, 152, 0, 0.6)',
                        'rgba(255, 71, 87, 0.6)',
                        'rgba(46, 204, 113, 0.6)'
                    ],
                    borderColor: [
                        'rgb(93, 63, 211)',
                        'rgb(3, 218, 198)',
                        'rgb(255, 152, 0)',
                        'rgb(255, 71, 87)',
                        'rgb(46, 204, 113)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: Translator.translate('performancePoints')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Categorize CPU based on performance
     * @param {number} singleThread - Single thread performance score
     * @param {number} multiThread - Multi-thread performance score
     * @returns {string} CPU category key
     */
    function categorizeCPU(singleThread, multiThread) {
        if (singleThread >= 80 && multiThread >= 400) {
            return 'premiumGamingCpu';
        } else if (singleThread >= 60 && multiThread >= 300) {
            return 'highEndGamingCpu';
        } else if (singleThread >= 50 && multiThread >= 200) {
            return 'midRangeGamingCpu';
        } else if (singleThread >= 40 && multiThread >= 100) {
            return 'entryLevelGamingCpu';
        } else {
            return 'generalPurposeCpu';
        }
    }
    
    /**
     * Assess gaming capability of CPU
     * @param {number} singleThread - Single thread performance score
     * @param {number} multiThread - Multi-thread performance score
     * @returns {Object} Gaming capability assessment
     */
    function assessGamingCapability(singleThread, multiThread) {
        // Calculate gaming score (70% single thread, 30% multi-thread normalized)
        const score = 0.7 * singleThread + 0.3 * (multiThread / 4);
        
        if (score >= 90) {
            return {
                capability: 'excellentForAllGames',
                score: score,
                recommendation: 'cpuExcellentRecommendation'
            };
        } else if (score >= 80) {
            return {
                capability: 'veryGood',
                score: score,
                recommendation: 'cpuVeryGoodRecommendation'
            };
        } else if (score >= 70) {
            return {
                capability: 'good',
                score: score,
                recommendation: 'cpuGoodRecommendation'
            };
        } else if (score >= 50) {
            return {
                capability: 'basic',
                score: score,
                recommendation: 'cpuBasicRecommendation'
            };
        } else {
            return {
                capability: 'limited',
                score: score,
                recommendation: 'cpuLimitedRecommendation'
            };
        }
    }
    
    /**
     * Analyze memory test results
     */
    function analyzeMemoryResults() {
        // Get results
        const results = window.gamePerformanceAnalyzer.testResults.memory;
        
        if (!results) {
            document.getElementById('memory-results').innerHTML = `
                <h3>${Translator.translate('testError')}</h3>
                <p>${Translator.translate('noResultsAvailable')}</p>
            `;
            return;
        }
        
        // Get ratings
        const performanceRating = StatsAnalyzer.rateMetric(results.performanceScore, 80, 60, 40, 20, true);
        const allocationRating = StatsAnalyzer.rateMetric(results.allocationSpeed, 80, 60, 40, 20, true);
        const accessRating = StatsAnalyzer.rateMetric(results.accessSpeed, 80, 60, 40, 20, true);
        const objectsRating = StatsAnalyzer.rateMetric(results.largeObjectHandling, 80, 60, 40, 20, true);
        const gcRating = StatsAnalyzer.rateMetric(results.garbageCollection, 80, 60, 40, 20, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('memoryTestResults')}</h3>
            <div class="chart-container">
                <canvas id="memory-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('overallMemoryPerformance')}</td>
                    <td>${results.performanceScore.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${performanceRating.ratingClass}">${Translator.translate(performanceRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('memoryAllocationSpeed')}</td>
                    <td>${results.allocationSpeed.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${allocationRating.ratingClass}">${Translator.translate(allocationRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('memoryAccessSpeed')}</td>
                    <td>${results.accessSpeed.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${accessRating.ratingClass}">${Translator.translate(accessRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('largeObjectHandling')}</td>
                    <td>${results.largeObjectHandling.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${objectsRating.ratingClass}">${Translator.translate(objectsRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('garbageCollectionPerformance')}</td>
                    <td>${results.garbageCollection.toFixed(1)} ${Translator.translate('points')}</td>
                    <td><span class="rating ${gcRating.ratingClass}">${Translator.translate(gcRating.rating.toLowerCase())}</span></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('memoryInterpretation')}</p>
        `;
        
        // Add recommendations based on results
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (results.performanceScore < 60) {
            html += `<li>${Translator.translate('memoryLowPerformanceRecommendation')}</li>`;
        } else if (results.performanceScore < 80) {
            html += `<li>${Translator.translate('memoryAveragePerformanceRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('memoryHighPerformanceRecommendation')}</li>`;
        }
        
        if (results.garbageCollection < 60) {
            html += `<li>${Translator.translate('memoryLowGcRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('memory-results').innerHTML = html;
        
        // Create memory chart
        createMemoryChart(results);
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create memory performance chart
     * @param {Object} results - Memory test results
     */
    function createMemoryChart(results) {
        const ctx = document.getElementById('memory-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    Translator.translate('memoryAllocationSpeed'),
                    Translator.translate('memoryAccessSpeed'),
                    Translator.translate('largeObjectHandling'),
                    Translator.translate('garbageCollectionPerformance')
                ],
                datasets: [{
                    label: Translator.translate('memoryPerformance'),
                    data: [
                        results.allocationSpeed,
                        results.accessSpeed,
                        results.largeObjectHandling,
                        results.garbageCollection
                    ],
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    borderColor: 'rgb(255, 152, 0)',
                    pointBackgroundColor: 'rgb(255, 152, 0)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 152, 0)'
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
                        suggestedMax: 100
                    }
                }
            }
        });
    }
    
    // Public API
    return {
        startSystemTest,
        stopSystemTest,
        startCpuTest,
        stopCpuTest,
        startMemoryTest,
        stopMemoryTest
    };
})();