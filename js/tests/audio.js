/**
 * Ultimate Gaming Performance Analyzer
 * Audio Test Module
 * 
 * This module handles audio latency and quality tests.
 */

const AudioTest = (function() {
    // Test state variables
    let latencyTestActive = false;
    let qualityTestActive = false;
    
    // Test data storage
    let latencyResults = {
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        jitter: 0,
        samples: []
    };
    
    let qualityResults = {
        qualityScore: 0,
        frequencyResponse: 0,
        distortion: 0,
        dynamicRange: 0
    };
    
    // Audio contexts and nodes
    let audioContext = null;
    let analyser = null;
    let oscillator = null;
    let testTone = null;
    
    // Test UI elements
    let latencyTestArea = null;
    let qualityTestArea = null;
    
    // Test intervals and timeouts
    let latencyTestInterval = null;
    let qualityTestInterval = null;
    
    /**
     * Initialize the audio context
     * @returns {boolean} True if initialization was successful
     */
    function initAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Create analyzer node
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            
            return true;
        } catch (error) {
            console.error('Error initializing audio context:', error);
            return false;
        }
    }
    
    /**
     * Initialize the audio latency test
     */
    function initLatencyTest() {
        latencyTestArea = document.getElementById('audio-latency-test-area');
        
        // Create test area content
        latencyTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('audioLatencyTestInstructions')}</p>
            </div>
            <div class="audio-test-container">
                <div class="audio-visualizer">
                    <canvas id="latency-visualizer" width="400" height="100"></canvas>
                </div>
                <div class="audio-controls">
                    <button id="play-test-tone" class="audio-btn">${Translator.translate('playTestTone')}</button>
                    <button id="stop-test-tone" class="audio-btn" disabled>${Translator.translate('stopTestTone')}</button>
                </div>
                <div class="audio-status" id="latency-status">${Translator.translate('readyToStart')}</div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('play-test-tone').addEventListener('click', playTestTone);
        document.getElementById('stop-test-tone').addEventListener('click', stopTestTone);
        
        // Initialize visualizer
        initLatencyVisualizer();
    }
    
    /**
     * Initialize the audio quality test
     */
    function initQualityTest() {
        qualityTestArea = document.getElementById('audio-quality-test-area');
        
        // Create test area content
        qualityTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('audioQualityTestInstructions')}</p>
            </div>
            <div class="audio-test-container">
                <div class="audio-visualizer">
                    <canvas id="quality-visualizer" width="400" height="100"></canvas>
                </div>
                <div class="frequency-response">
                    <canvas id="frequency-response" width="400" height="100"></canvas>
                </div>
                <div class="audio-controls">
                    <button id="play-frequency-sweep" class="audio-btn">${Translator.translate('playFrequencySweep')}</button>
                    <button id="test-dynamic-range" class="audio-btn">${Translator.translate('testDynamicRange')}</button>
                </div>
                <div class="audio-status" id="quality-status">${Translator.translate('readyToStart')}</div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('play-frequency-sweep').addEventListener('click', playFrequencySweep);
        document.getElementById('test-dynamic-range').addEventListener('click', testDynamicRange);
        
        // Initialize visualizer
        initQualityVisualizer();
    }
    
    /**
     * Initialize audio latency visualizer
     */
    function initLatencyVisualizer() {
        const canvas = document.getElementById('latency-visualizer');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Draw baseline
        ctx.fillStyle = 'rgb(30, 30, 30)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgb(93, 63, 211)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    /**
     * Initialize audio quality visualizer
     */
    function initQualityVisualizer() {
        const canvas = document.getElementById('quality-visualizer');
        const freqCanvas = document.getElementById('frequency-response');
        if (!canvas || !freqCanvas) return;
        
        const ctx = canvas.getContext('2d');
        const freqCtx = freqCanvas.getContext('2d');
        
        // Draw baseline for waveform
        ctx.fillStyle = 'rgb(30, 30, 30)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgb(3, 218, 198)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Draw baseline for frequency response
        freqCtx.fillStyle = 'rgb(30, 30, 30)';
        freqCtx.fillRect(0, 0, freqCanvas.width, freqCanvas.height);
        
        freqCtx.strokeStyle = 'rgb(255, 152, 0)';
        freqCtx.lineWidth = 1;
        freqCtx.beginPath();
        freqCtx.moveTo(0, freqCanvas.height - 10);
        freqCtx.lineTo(freqCanvas.width, freqCanvas.height - 10);
        freqCtx.stroke();
    }
    
    /**
     * Play a test tone for latency measurement
     */
    function playTestTone() {
        if (!audioContext) {
            if (!initAudioContext()) {
                document.getElementById('latency-status').textContent = Translator.translate('audioContextError');
                return;
            }
        }
        
        // Update UI
        document.getElementById('play-test-tone').disabled = true;
        document.getElementById('stop-test-tone').disabled = false;
        document.getElementById('latency-status').textContent = Translator.translate('measuringLatency');
        
        // Create oscillator
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 1kHz tone
        
        // Connect oscillator to analyzer and output
        oscillator.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Record start time
        const startTime = performance.now();
        
        // Start the oscillator
        oscillator.start();
        
        // Listen for audio output using AnalyserNode
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Function to check if audio is playing
        const checkAudioOutput = () => {
            analyser.getByteTimeDomainData(dataArray);
            
            // Check if audio signal is present
            let signalPresent = false;
            for (let i = 0; i < bufferLength; i++) {
                // If value deviates from 128 (center), signal is present
                if (Math.abs(dataArray[i] - 128) > 10) {
                    signalPresent = true;
                    break;
                }
            }
            
            if (signalPresent) {
                // Measure latency
                const latency = performance.now() - startTime;
                
                // Store result
                latencyResults.samples.push(latency);
                
                // Update visualizer
                updateLatencyVisualizer(latency);
                
                // Update status
                document.getElementById('latency-status').textContent = 
                    `${Translator.translate('measuredLatency')}: ${latency.toFixed(2)} ms`;
                
                // Continue testing
                if (latencyResults.samples.length < 10) {
                    // Stop current tone
                    if (oscillator) {
                        oscillator.stop();
                        oscillator.disconnect();
                        oscillator = null;
                    }
                    
                    // Wait a bit before next measurement
                    setTimeout(() => {
                        if (latencyTestActive) {
                            playTestTone();
                        }
                    }, 1000);
                } else {
                    // Stop test after enough samples
                    stopTestTone();
                }
            } else if (latencyTestActive) {
                // Continue checking if no signal yet
                latencyTestInterval = requestAnimationFrame(checkAudioOutput);
            }
        };
        
        // Start checking for audio output
        latencyTestInterval = requestAnimationFrame(checkAudioOutput);
    }
    
    /**
     * Stop the test tone
     */
    function stopTestTone() {
        // Cancel interval
        if (latencyTestInterval) {
            cancelAnimationFrame(latencyTestInterval);
            latencyTestInterval = null;
        }
        
        // Stop oscillator
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
        
        // Update UI
        document.getElementById('play-test-tone').disabled = false;
        document.getElementById('stop-test-tone').disabled = true;
        document.getElementById('latency-status').textContent = 
            latencyResults.samples.length > 0 ? 
            `${Translator.translate('testCompleted')}` : 
            Translator.translate('testStopped');
        
        // Calculate results if we have samples
        if (latencyResults.samples.length > 0) {
            calculateLatencyResults();
        }
    }
    
    /**
     * Update the latency visualizer
     * @param {number} latency - Measured latency in ms
     */
    function updateLatencyVisualizer(latency) {
        const canvas = document.getElementById('latency-visualizer');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = 'rgb(30, 30, 30)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw baseline
        ctx.strokeStyle = 'rgb(93, 63, 211, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Draw latency bar
        const maxLatency = 100; // 100ms as max for visualization
        const barHeight = Math.min(canvas.height * 0.8, (latency / maxLatency) * canvas.height * 0.8);
        
        ctx.fillStyle = getLatencyColor(latency);
        ctx.fillRect(canvas.width / 2 - 40, canvas.height - barHeight, 80, barHeight);
        
        // Draw latency value
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${latency.toFixed(1)} ms`, canvas.width / 2, canvas.height - barHeight - 10);
        
        // Draw all samples if available
        if (latencyResults.samples.length > 1) {
            const barWidth = Math.max(2, Math.floor(canvas.width / (latencyResults.samples.length + 2)));
            const padding = Math.floor((canvas.width - barWidth * latencyResults.samples.length) / 2);
            
            for (let i = 0; i < latencyResults.samples.length; i++) {
                const sampleLatency = latencyResults.samples[i];
                const sBarHeight = Math.min(canvas.height * 0.7, (sampleLatency / maxLatency) * canvas.height * 0.7);
                
                ctx.fillStyle = getLatencyColor(sampleLatency, 0.5);
                ctx.fillRect(padding + i * barWidth, canvas.height - sBarHeight, barWidth - 1, sBarHeight);
            }
        }
    }
    
    /**
     * Get color based on latency value
     * @param {number} latency - Latency in ms
     * @param {number} alpha - Alpha transparency (0-1)
     * @returns {string} Color as CSS string
     */
    function getLatencyColor(latency, alpha = 1) {
        if (latency < 10) {
            return `rgba(46, 204, 113, ${alpha})`; // Green - excellent
        } else if (latency < 20) {
            return `rgba(3, 218, 198, ${alpha})`; // Teal - good
        } else if (latency < 40) {
            return `rgba(255, 152, 0, ${alpha})`; // Orange - average
        } else {
            return `rgba(255, 71, 87, ${alpha})`; // Red - poor
        }
    }
    
    /**
     * Calculate the final latency results
     */
    function calculateLatencyResults() {
        if (latencyResults.samples.length === 0) return;
        
        // Filter outliers if enabled
        let filteredSamples = latencyResults.samples;
        if (document.getElementById('filter-outliers').checked) {
            filteredSamples = StatsAnalyzer.filterOutliers(latencyResults.samples);
        }
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            filteredSamples = StatsAnalyzer.applyNoiseReduction(filteredSamples, noiseReductionMethod);
        }
        
        // Calculate statistics
        latencyResults.avgLatency = StatsAnalyzer.calculateAverage(filteredSamples);
        latencyResults.minLatency = StatsAnalyzer.calculateMin(filteredSamples);
        latencyResults.maxLatency = StatsAnalyzer.calculateMax(filteredSamples);
        latencyResults.jitter = StatsAnalyzer.calculateJitter(filteredSamples);
        
        // Display results
        displayLatencyResults();
    }
    
    /**
     * Display the latency test results
     */
    function displayLatencyResults() {
        // Update global test results
        window.gamePerformanceAnalyzer.testResults.audioLatency = latencyResults;
        
        // Get ratings
        const latencyRating = StatsAnalyzer.rateMetric(latencyResults.avgLatency, 10, 20, 40, 60);
        const jitterRating = StatsAnalyzer.rateMetric(latencyResults.jitter, 1, 3, 5, 10);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('audioLatencyResults')}</h3>
            <div class="chart-container">
                <canvas id="latency-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageLatency')}</td>
                    <td>${latencyResults.avgLatency.toFixed(2)} ms</td>
                    <td><span class="rating ${latencyRating.ratingClass}">${Translator.translate(latencyRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumLatency')}</td>
                    <td>${latencyResults.minLatency.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumLatency')}</td>
                    <td>${latencyResults.maxLatency.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('latencyJitter')}</td>
                    <td>${latencyResults.jitter.toFixed(2)} ms</td>
                    <td><span class="rating ${jitterRating.ratingClass}">${Translator.translate(jitterRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('sampleCount')}</td>
                    <td>${latencyResults.samples.length}</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('audioLatencyInterpretation')}</p>
        `;
        
        // Add recommendations based on results
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (latencyResults.avgLatency > 40) {
            html += `<li>${Translator.translate('audioHighLatencyRecommendation')}</li>`;
        } else if (latencyResults.avgLatency > 20) {
            html += `<li>${Translator.translate('audioMediumLatencyRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('audioLowLatencyRecommendation')}</li>`;
        }
        
        if (latencyResults.jitter > 5) {
            html += `<li>${Translator.translate('audioHighJitterRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('audio-latency-results').innerHTML = html;
        
        // Create results chart
        createLatencyResultsChart();
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create latency results chart
     */
    function createLatencyResultsChart() {
        const canvas = document.getElementById('latency-results-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: latencyResults.samples.length}, (_, i) => i + 1),
                datasets: [{
                    label: Translator.translate('audioLatency') + ' (ms)',
                    data: latencyResults.samples,
                    backgroundColor: latencyResults.samples.map(val => getLatencyColor(val, 0.6)),
                    borderColor: latencyResults.samples.map(val => getLatencyColor(val)),
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
                            text: Translator.translate('latencyMs')
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('sampleNumber')
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Play a frequency sweep to test frequency response
     */
    function playFrequencySweep() {
        if (!audioContext) {
            if (!initAudioContext()) {
                document.getElementById('quality-status').textContent = Translator.translate('audioContextError');
                return;
            }
        }
        
        // Update status
        document.getElementById('quality-status').textContent = Translator.translate('playingFrequencySweep');
        
        // Create oscillator
        oscillator = audioContext.createOscillator();
        
        // Create gain node
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // 50% volume
        
        // Connect oscillator to gain node, analyzer, and output
        oscillator.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Set up frequency sweep
        const startFreq = 20; // 20 Hz
        const endFreq = 20000; // 20 kHz
        const sweepDuration = 5; // 5 seconds
        
        oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + sweepDuration);
        
        // Start oscillator
        oscillator.start();
        
        // Set up visualization
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvas = document.getElementById('quality-visualizer');
        const freqCanvas = document.getElementById('frequency-response');
        if (!canvas || !freqCanvas) return;
        
        const ctx = canvas.getContext('2d');
        const freqCtx = freqCanvas.getContext('2d');
        
        // Function to visualize audio data
        const visualize = () => {
            // Get time domain data for waveform
            analyser.getByteTimeDomainData(dataArray);
            
            // Clear canvas
            ctx.fillStyle = 'rgb(30, 30, 30)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(3, 218, 198)';
            ctx.beginPath();
            
            const sliceWidth = canvas.width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            
            // Get frequency data
            const freqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(freqData);
            
            // Draw frequency response
            freqCtx.fillStyle = 'rgb(30, 30, 30)';
            freqCtx.fillRect(0, 0, freqCanvas.width, freqCanvas.height);
            
            freqCtx.lineWidth = 2;
            freqCtx.strokeStyle = 'rgb(255, 152, 0)';
            freqCtx.beginPath();
            
            const barWidth = freqCanvas.width / (freqData.length / 4); // Only show first quarter (0-10kHz)
            let freqX = 0;
            
            for (let i = 0; i < freqData.length / 4; i++) {
                const freqValue = freqData[i];
                const freqY = freqCanvas.height - (freqValue / 256 * freqCanvas.height);
                
                if (i === 0) {
                    freqCtx.moveTo(freqX, freqY);
                } else {
                    freqCtx.lineTo(freqX, freqY);
                }
                
                freqX += barWidth;
            }
            
            freqCtx.stroke();
            
            // Continue animation
            if (oscillator && oscillator.frequency.value < 20000) {
                requestAnimationFrame(visualize);
            } else {
                // Stop oscillator after sweep is complete
                if (oscillator) {
                    setTimeout(() => {
                        if (oscillator) {
                            oscillator.stop();
                            oscillator.disconnect();
                            oscillator = null;
                        }
                        document.getElementById('quality-status').textContent = Translator.translate('frequencySweepComplete');
                        
                        // Analyze the frequency response
                        analyzeFrequencyResponse(freqData);
                    }, 500);
                }
            }
        };
        
        // Start visualization
        visualize();
        
        // Stop the oscillator after the sweep duration
        setTimeout(() => {
            if (oscillator) {
                oscillator.stop();
                oscillator.disconnect();
                oscillator = null;
            }
        }, (sweepDuration + 1) * 1000);
    }
    
    /**
     * Analyze frequency response data
     * @param {Uint8Array} freqData - Frequency domain data
     */
    function analyzeFrequencyResponse(freqData) {
        // Calculate frequency response score
        // Higher score = flatter frequency response
        let sum = 0;
        let count = 0;
        let variance = 0;
        
        // Calculate average amplitude in audible range
        for (let i = 5; i < freqData.length / 2; i++) {
            sum += freqData[i];
            count++;
        }
        
        const avg = sum / count;
        
        // Calculate variance
        for (let i = 5; i < freqData.length / 2; i++) {
            variance += (freqData[i] - avg) ** 2;
        }
        
        variance /= count;
        
        // Lower variance = more flat response = better
        const flatnessScore = Math.max(0, 100 - (Math.sqrt(variance) / 2));
        
        // Store result
        qualityResults.frequencyResponse = flatnessScore;
        
        // Update quality score
        updateQualityScore();
    }
    
    /**
     * Test dynamic range
     */
    function testDynamicRange() {
        if (!audioContext) {
            if (!initAudioContext()) {
                document.getElementById('quality-status').textContent = Translator.translate('audioContextError');
                return;
            }
        }
        
        // Update status
        document.getElementById('quality-status').textContent = Translator.translate('testingDynamicRange');
        
        // Create oscillator
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 1kHz tone
        
        // Create gain node
        const gainNode = audioContext.createGain();
        
        // Connect oscillator to gain node, analyzer, and output
        oscillator.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Set up gain sweep to test dynamic range
        const testDuration = 5; // 5 seconds
        
        // Start with very low volume, then increase to max, then back to low
        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Start at -60dB
        gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + testDuration / 2); // Ramp to 0dB
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + testDuration); // Back to -60dB
        
        // Start oscillator
        oscillator.start();
        
        // Set up visualization
        const canvas = document.getElementById('quality-visualizer');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Variables to track dynamic range
        let minLevel = 256;
        let maxLevel = 0;
        
        // Function to visualize audio levels
        const visualize = () => {
            // Get audio levels
            const freqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(freqData);
            
            // Find peak level at test frequency
            let peakLevel = 0;
            for (let i = 9; i < 12; i++) { // Approximating 1kHz bin
                peakLevel = Math.max(peakLevel, freqData[i]);
            }
            
            // Update min/max levels
            minLevel = Math.min(minLevel, peakLevel);
            maxLevel = Math.max(maxLevel, peakLevel);
            
            // Clear canvas
            ctx.fillStyle = 'rgb(30, 30, 30)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw level meter
            const levelHeight = (peakLevel / 256) * canvas.height;
            
            ctx.fillStyle = 'rgba(3, 218, 198, 0.8)';
            ctx.fillRect(canvas.width / 2 - 100, canvas.height - levelHeight, 200, levelHeight);
            
            // Draw level text
            const dbLevel = peakLevel > 0 ? 20 * Math.log10(peakLevel / 256) : -60;
            
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${dbLevel.toFixed(1)} dB`, canvas.width / 2, canvas.height - levelHeight - 10);
            
            // Continue animation
            if (oscillator && audioContext.currentTime < audioContext.currentTime + testDuration) {
                requestAnimationFrame(visualize);
            } else {
                // Stop oscillator after test is complete
                if (oscillator) {
                    setTimeout(() => {
                        if (oscillator) {
                            oscillator.stop();
                            oscillator.disconnect();
                            oscillator = null;
                        }
                        document.getElementById('quality-status').textContent = Translator.translate('dynamicRangeTestComplete');
                        
                        // Calculate dynamic range
                        const dynamicRange = maxLevel > 0 ? 20 * Math.log10(maxLevel / Math.max(1, minLevel)) : 0;
                        
                        // Score is based on range (capped at 60dB which is very good)
                        const rangeScore = Math.min(100, dynamicRange * 5 / 3);
                        
                        // Store result
                        qualityResults.dynamicRange = rangeScore;
                        
                        // Update quality score
                        updateQualityScore();
                        
                        // Show result
                        document.getElementById('quality-status').textContent = 
                            `${Translator.translate('dynamicRange')}: ${dynamicRange.toFixed(1)} dB`;
                    }, 500);
                }
            }
        };
        
        // Start visualization
        visualize();
        
        // Stop the oscillator after the test duration
        setTimeout(() => {
            if (oscillator) {
                oscillator.stop();
                oscillator.disconnect();
                oscillator = null;
            }
        }, (testDuration + 1) * 1000);
    }
    
    /**
     * Update the overall audio quality score
     */
    function updateQualityScore() {
        // Calculate quality score based on test results
        const weights = {
            frequencyResponse: 0.5,
            distortion: 0.2,
            dynamicRange: 0.3
        };
        
        // Set default distortion score if not tested
        if (qualityResults.distortion === 0) {
            qualityResults.distortion = 80; // Assume reasonably good
        }
        
        let score = 0;
        let weightSum = 0;
        
        for (const [test, weight] of Object.entries(weights)) {
            if (qualityResults[test] > 0) {
                score += qualityResults[test] * weight;
                weightSum += weight;
            }
        }
        
        if (weightSum > 0) {
            qualityResults.qualityScore = score / weightSum;
        } else {
            qualityResults.qualityScore = 0;
        }
        
        // Display results if enough tests completed
        if ((qualityResults.frequencyResponse > 0 || qualityResults.dynamicRange > 0) && 
            qualityTestActive) {
            displayQualityResults();
        }
    }
    
    /**
     * Display the audio quality test results
     */
    function displayQualityResults() {
        // Update global test results
        window.gamePerformanceAnalyzer.testResults.audioQuality = qualityResults;
        
        // Get ratings
        const qualityRating = StatsAnalyzer.rateMetric(qualityResults.qualityScore, 90, 75, 60, 45, true);
        const frequencyRating = StatsAnalyzer.rateMetric(qualityResults.frequencyResponse, 90, 75, 60, 45, true);
        const rangeRating = StatsAnalyzer.rateMetric(qualityResults.dynamicRange, 90, 70, 50, 30, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('audioQualityResults')}</h3>
            <div class="chart-container">
                <canvas id="quality-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('overallQualityScore')}</td>
                    <td>${qualityResults.qualityScore.toFixed(1)}/100</td>
                    <td><span class="rating ${qualityRating.ratingClass}">${Translator.translate(qualityRating.rating.toLowerCase())}</span></td>
                </tr>
        `;
        
        if (qualityResults.frequencyResponse > 0) {
            html += `
                <tr>
                    <td>${Translator.translate('frequencyResponse')}</td>
                    <td>${qualityResults.frequencyResponse.toFixed(1)}/100</td>
                    <td><span class="rating ${frequencyRating.ratingClass}">${Translator.translate(frequencyRating.rating.toLowerCase())}</span></td>
                </tr>
            `;
        }
        
        if (qualityResults.dynamicRange > 0) {
            html += `
                <tr>
                    <td>${Translator.translate('dynamicRange')}</td>
                    <td>${qualityResults.dynamicRange.toFixed(1)}/100</td>
                    <td><span class="rating ${rangeRating.ratingClass}">${Translator.translate(rangeRating.rating.toLowerCase())}</span></td>
                </tr>
            `;
        }
        
        html += `
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('audioQualityInterpretation')}</p>
        `;
        
        // Add recommendations
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (qualityResults.qualityScore < 60) {
            html += `<li>${Translator.translate('audioLowQualityRecommendation')}</li>`;
        } else if (qualityResults.qualityScore < 80) {
            html += `<li>${Translator.translate('audioMediumQualityRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('audioHighQualityRecommendation')}</li>`;
        }
        
        if (qualityResults.frequencyResponse < 70) {
            html += `<li>${Translator.translate('audioPoorFrequencyRecommendation')}</li>`;
        }
        
        if (qualityResults.dynamicRange < 60) {
            html += `<li>${Translator.translate('audioPoorDynamicRangeRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('audio-quality-results').innerHTML = html;
        
        // Create results chart
        createQualityResultsChart();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }
    
    /**
     * Create quality results chart
     */
    function createQualityResultsChart() {
        const canvas = document.getElementById('quality-results-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Prepare data for radar chart
        const labels = [];
        const data = [];
        
        if (qualityResults.frequencyResponse > 0) {
            labels.push(Translator.translate('frequencyResponse'));
            data.push(qualityResults.frequencyResponse);
        }
        
        if (qualityResults.distortion > 0) {
            labels.push(Translator.translate('distortion'));
            data.push(qualityResults.distortion);
        }
        
        if (qualityResults.dynamicRange > 0) {
            labels.push(Translator.translate('dynamicRange'));
            data.push(qualityResults.dynamicRange);
        }
        
        // Add overall score
        labels.push(Translator.translate('overallQuality'));
        data.push(qualityResults.qualityScore);
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: Translator.translate('audioQuality'),
                    data: data,
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
    
    /**
     * Start the audio latency test
     */
    function startLatencyTest() {
        // Initialize test if needed
        if (!latencyTestArea) {
            initLatencyTest();
        }
        
        // Reset test data
        latencyTestActive = true;
        latencyResults = {
            avgLatency: 0,
            minLatency: 0,
            maxLatency: 0,
            jitter: 0,
            samples: []
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('audio-latency-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('audioLatencyTestRunning')}</p>
        `;
        
        // Start the test
        playTestTone();
    }
    
    /**
     * Stop the audio latency test
     */
    function stopLatencyTest() {
        latencyTestActive = false;
        
        // Stop any ongoing test
        stopTestTone();
        
        // Display results if we have data
        if (latencyResults.samples.length > 0) {
            calculateLatencyResults();
        } else {
            document.getElementById('audio-latency-results').innerHTML = `
                <h3>${Translator.translate('testStopped')}</h3>
                <p>${Translator.translate('notEnoughData')}</p>
            `;
        }
    }
    
    /**
     * Start the audio quality test
     */
    function startQualityTest() {
        // Initialize test if needed
        if (!qualityTestArea) {
            initQualityTest();
        }
        
        // Reset test data
        qualityTestActive = true;
        qualityResults = {
            qualityScore: 0,
            frequencyResponse: 0,
            distortion: 0,
            dynamicRange: 0
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('audio-quality-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('audioQualityTestRunning')}</p>
        `;
        
        // Initialize status
        document.getElementById('quality-status').textContent = 
            Translator.translate('selectQualityTest');
    }
    
    /**
     * Stop the audio quality test
     */
    function stopQualityTest() {
        qualityTestActive = false;
        
        // Stop any ongoing test
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
        
        // Calculate final score
        updateQualityScore();
        
        // Display results if we have data
        if (qualityResults.frequencyResponse > 0 || qualityResults.dynamicRange > 0) {
            displayQualityResults();
        } else {
            document.getElementById('audio-quality-results').innerHTML = `
                <h3>${Translator.translate('testStopped')}</h3>
                <p>${Translator.translate('notEnoughData')}</p>
            `;
        }
    }
    
    // Public API
    return {
        startLatencyTest,
        stopLatencyTest,
        startQualityTest,
        stopQualityTest
    };
})();