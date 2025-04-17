/**
 * Ultimate Gaming Performance Analyzer
 * Statistical Analysis Module
 * 
 * This module provides utilities for processing and analyzing test results.
 */

const StatsAnalyzer = (function() {
    /**
     * Calculate the average of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The average value
     */
    function calculateAverage(data) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((a, b) => a + b, 0);
        return sum / data.length;
    }
    
    /**
     * Calculate the median of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The median value
     */
    function calculateMedian(data) {
        if (!data || data.length === 0) return 0;
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => a - b);
        
        // Find the middle index
        const middle = Math.floor(sortedData.length / 2);
        
        // If the length is odd, return the middle element
        if (sortedData.length % 2 === 1) {
            return sortedData[middle];
        }
        
        // If the length is even, return the average of the two middle elements
        return (sortedData[middle - 1] + sortedData[middle]) / 2;
    }
    
    /**
     * Calculate a specific percentile of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @param {number} percentile - The percentile to calculate (0-1)
     * @returns {number} The percentile value
     */
    function calculatePercentile(data, percentile) {
        if (!data || data.length === 0) return 0;
        if (percentile < 0 || percentile > 1) {
            throw new Error('Percentile must be between 0 and 1');
        }
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => a - b);
        
        // Calculate the index
        const index = percentile * (sortedData.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        if (upper >= sortedData.length) return sortedData[sortedData.length - 1];
        if (lower === upper) return sortedData[lower];
        
        // Interpolate between the two values
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
    }
    
    /**
     * Calculate the standard deviation of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The standard deviation
     */
    function calculateStandardDeviation(data) {
        if (!data || data.length <= 1) return 0;
        
        const avg = calculateAverage(data);
        const squareDiffs = data.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        
        const avgSquareDiff = calculateAverage(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
    
    /**
     * Calculate the variance of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The variance
     */
    function calculateVariance(data) {
        if (!data || data.length <= 1) return 0;
        
        const avg = calculateAverage(data);
        const squareDiffs = data.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        
        return calculateAverage(squareDiffs);
    }
    
    /**
     * Calculate the minimum value in an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The minimum value
     */
    function calculateMin(data) {
        if (!data || data.length === 0) return 0;
        return Math.min(...data);
    }
    
    /**
     * Calculate the maximum value in an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The maximum value
     */
    function calculateMax(data) {
        if (!data || data.length === 0) return 0;
        return Math.max(...data);
    }
    
    /**
     * Calculate the range (max - min) of an array of numbers
     * @param {Array<number>} data - Array of numeric values
     * @returns {number} The range
     */
    function calculateRange(data) {
        if (!data || data.length === 0) return 0;
        return calculateMax(data) - calculateMin(data);
    }
    
    /**
     * Filter outliers from an array of numbers using the IQR method
     * @param {Array<number>} data - Array of numeric values
     * @param {number} factor - Multiplier for the IQR (default: 1.5)
     * @returns {Array<number>} Filtered array without outliers
     */
    function filterOutliers(data, factor = 1.5) {
        if (!data || data.length <= 4) return data;
        
        // Calculate the quartiles
        const sortedData = [...data].sort((a, b) => a - b);
        const q1 = calculatePercentile(sortedData, 0.25);
        const q3 = calculatePercentile(sortedData, 0.75);
        
        // Calculate the IQR and bounds
        const iqr = q3 - q1;
        const lowerBound = q1 - (iqr * factor);
        const upperBound = q3 + (iqr * factor);
        
        // Filter the data
        return data.filter(value => value >= lowerBound && value <= upperBound);
    }
    
    /**
     * Apply noise reduction algorithm to data
     * @param {Array<number>} data - Array of numeric values
     * @param {string} method - Noise reduction method ('none', 'average', 'median', 'kalman')
     * @param {Object} options - Additional options for the algorithm
     * @returns {Array<number>} Filtered data
     */
    function applyNoiseReduction(data, method = 'average', options = {}) {
        if (!data || data.length <= 2) {
            return data;
        }
        
        switch (method) {
            case 'none':
                return data;
                
            case 'average':
                return applyMovingAverage(data, options.windowSize || 3);
                
            case 'median':
                return applyMedianFilter(data, options.windowSize || 3);
                
            case 'kalman':
                return applyKalmanFilter(data, options);
                
            default:
                console.warn(`Unknown noise reduction method: ${method}, using 'average'`);
                return applyMovingAverage(data, options.windowSize || 3);
        }
    }
    
    /**
     * Apply moving average filter to data
     * @param {Array<number>} data - Array of numeric values
     * @param {number} windowSize - Size of the moving window
     * @returns {Array<number>} Filtered data
     */
    function applyMovingAverage(data, windowSize = 3) {
        const result = [];
        
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            
            for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
                 j <= Math.min(data.length - 1, i + Math.floor(windowSize / 2)); j++) {
                sum += data[j];
                count++;
            }
            
            result.push(sum / count);
        }
        
        return result;
    }
    
    /**
     * Apply median filter to data
     * @param {Array<number>} data - Array of numeric values
     * @param {number} windowSize - Size of the moving window
     * @returns {Array<number>} Filtered data
     */
    function applyMedianFilter(data, windowSize = 3) {
        const result = [];
        
        for (let i = 0; i < data.length; i++) {
            const window = [];
            
            for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
                 j <= Math.min(data.length - 1, i + Math.floor(windowSize / 2)); j++) {
                window.push(data[j]);
            }
            
            window.sort((a, b) => a - b);
            result.push(window[Math.floor(window.length / 2)]);
        }
        
        return result;
    }
    
    /**
     * Apply simplified Kalman filter to data
     * @param {Array<number>} data - Array of numeric values
     * @param {Object} options - Kalman filter options
     * @returns {Array<number>} Filtered data
     */
    function applyKalmanFilter(data, options = {}) {
        const result = [];
        const processNoise = options.processNoise || 0.01;
        const measurementNoise = options.measurementNoise || 0.1;
        
        let estimate = data[0];
        let errorEstimate = 1;
        
        for (let i = 0; i < data.length; i++) {
            // Prediction
            const predictedEstimate = estimate;
            const predictedErrorEstimate = errorEstimate + processNoise;
            
            // Update
            const kalmanGain = predictedErrorEstimate / (predictedErrorEstimate + measurementNoise);
            estimate = predictedEstimate + kalmanGain * (data[i] - predictedEstimate);
            errorEstimate = (1 - kalmanGain) * predictedErrorEstimate;
            
            result.push(estimate);
        }
        
        return result;
    }
    
    /**
     * Create a histogram from data
     * @param {Array<number>} data - Array of numeric values
     * @param {number} bins - Number of bins
     * @returns {Object} Histogram data with bins and frequencies
     */
    function createHistogram(data, bins = 10) {
        if (!data || data.length === 0) return { bins: [], frequencies: [] };
        
        const min = calculateMin(data);
        const max = calculateMax(data);
        const range = max - min;
        
        // Calculate bin width
        const binWidth = range / bins;
        
        // Initialize bins and frequencies
        const binEdges = [];
        const frequencies = new Array(bins).fill(0);
        
        // Calculate bin edges
        for (let i = 0; i <= bins; i++) {
            binEdges.push(min + i * binWidth);
        }
        
        // Count data points in each bin
        for (const value of data) {
            // Special case for the maximum value
            if (value === max) {
                frequencies[bins - 1]++;
                continue;
            }
            
            const binIndex = Math.floor((value - min) / binWidth);
            frequencies[binIndex]++;
        }
        
        return {
            binEdges,
            frequencies,
            binWidth
        };
    }
    
    /**
     * Calculate linear regression for x,y data points
     * @param {Array<number>} xData - X values
     * @param {Array<number>} yData - Y values
     * @returns {Object} Regression results (slope, intercept, r2)
     */
    function calculateLinearRegression(xData, yData) {
        if (!xData || !yData || xData.length !== yData.length || xData.length === 0) {
            return { slope: 0, intercept: 0, r2: 0 };
        }
        
        const n = xData.length;
        
        // Calculate means
        const xMean = calculateAverage(xData);
        const yMean = calculateAverage(yData);
        
        // Calculate slope and intercept
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
            numerator += (xData[i] - xMean) * (yData[i] - yMean);
            denominator += (xData[i] - xMean) * (xData[i] - xMean);
        }
        
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = yMean - slope * xMean;
        
        // Calculate R-squared
        let ssr = 0;  // Sum of squares due to regression
        let sst = 0;  // Total sum of squares
        
        for (let i = 0; i < n; i++) {
            const prediction = slope * xData[i] + intercept;
            ssr += Math.pow(prediction - yMean, 2);
            sst += Math.pow(yData[i] - yMean, 2);
        }
        
        const r2 = sst !== 0 ? ssr / sst : 0;
        
        return { slope, intercept, r2 };
    }
    
    /**
     * Calculate the Pearson correlation coefficient between two datasets
     * @param {Array<number>} xData - First dataset
     * @param {Array<number>} yData - Second dataset
     * @returns {number} Correlation coefficient (-1 to 1)
     */
    function calculateCorrelation(xData, yData) {
        if (!xData || !yData || xData.length !== yData.length || xData.length === 0) {
            return 0;
        }
        
        const n = xData.length;
        
        // Calculate means
        const xMean = calculateAverage(xData);
        const yMean = calculateAverage(yData);
        
        // Calculate correlation
        let numerator = 0;
        let xDenominator = 0;
        let yDenominator = 0;
        
        for (let i = 0; i < n; i++) {
            numerator += (xData[i] - xMean) * (yData[i] - yMean);
            xDenominator += Math.pow(xData[i] - xMean, 2);
            yDenominator += Math.pow(yData[i] - yMean, 2);
        }
        
        const denominator = Math.sqrt(xDenominator * yDenominator);
        
        return denominator !== 0 ? numerator / denominator : 0;
    }
    
    /**
     * Calculate the jitter (variability) in timing data
     * @param {Array<number>} data - Timing data
     * @returns {number} Jitter value
     */
    function calculateJitter(data) {
        if (!data || data.length <= 1) return 0;
        
        let totalJitter = 0;
        
        for (let i = 1; i < data.length; i++) {
            totalJitter += Math.abs(data[i] - data[i-1]);
        }
        
        return totalJitter / (data.length - 1);
    }
    
    /**
     * Detect the frame rate from timing data
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @returns {number} Detected frame rate in Hz
     */
    function detectFrameRate(frameTimes) {
        if (!frameTimes || frameTimes.length === 0) return 0;
        
        // Calculate average frame time
        const avgFrameTime = calculateAverage(frameTimes);
        
        // Convert to frame rate (Hz)
        const frameRate = 1000 / avgFrameTime;
        
        // Standard refresh rates to snap to
        const standardRates = [30, 60, 75, 120, 144, 165, 240, 360, 390, 480];
        
        // Find the closest standard rate
        return standardRates.reduce((prev, curr) => 
            Math.abs(curr - frameRate) < Math.abs(prev - frameRate) ? curr : prev
        );
    }
    
    /**
     * Detect if VSync is enabled based on frame timing
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @param {number} refreshRate - Display refresh rate in Hz
     * @returns {boolean} True if VSync is likely enabled
     */
    function detectVSync(frameTimes, refreshRate) {
        if (!frameTimes || frameTimes.length === 0 || !refreshRate) return false;
        
        // Expected frame time for the refresh rate
        const expectedFrameTime = 1000 / refreshRate;
        
        // Threshold for consistency (5% of expected frame time)
        const threshold = expectedFrameTime * 0.05;
        
        // Count frames that are close to the expected time
        let consistentFrames = 0;
        
        for (const frameTime of frameTimes) {
            if (Math.abs(frameTime - expectedFrameTime) <= threshold) {
                consistentFrames++;
            }
        }
        
        // If more than 90% of frames are consistent with refresh rate, VSync is likely enabled
        return consistentFrames / frameTimes.length > 0.9;
    }
    
    /**
     * Detect if adaptive sync is enabled based on frame timing
     * @param {Array<number>} frameTimes - Frame timing data in ms
     * @param {number} jitter - Measured jitter
     * @returns {boolean} True if adaptive sync is likely enabled
     */
    function detectAdaptiveSync(frameTimes, jitter) {
        if (!frameTimes || frameTimes.length === 0) return false;
        
        // Adaptive sync typically has low jitter but variable frame times
        // Unlike VSync which forces frames to align with refresh rate
        
        // Calculate variance in frame times
        const variance = calculateVariance(frameTimes);
        
        // Check if jitter is low but variance exists
        return jitter < 1.5 && variance > 0.5 && !detectVSync(frameTimes, detectFrameRate(frameTimes));
    }
    
    /**
     * Calculate consistency metrics for timing data
     * @param {Array<number>} data - Timing data
     * @returns {Object} Consistency metrics
     */
    function calculateConsistencyMetrics(data) {
        if (!data || data.length <= 1) {
            return { 
                consistencyIndex: 0,
                stabilityIndex: 0,
                variabilityIndex: 100,
                outlierPercentage: 0
            };
        }
        
        // Calculate basic statistics
        const avg = calculateAverage(data);
        const stdDev = calculateStandardDeviation(data);
        const jitter = calculateJitter(data);
        
        // Calculate consistency index (higher is better)
        // 100% means all values are identical
        const consistencyIndex = Math.max(0, 100 - (stdDev / avg * 100));
        
        // Calculate stability index (higher is better)
        // Based on jitter relative to average
        const stabilityIndex = Math.max(0, 100 - (jitter / avg * 100));
        
        // Calculate variability index (lower is better)
        // Coefficient of variation as percentage
        const variabilityIndex = (stdDev / avg) * 100;
        
        // Calculate outlier percentage
        const outliers = data.length - filterOutliers(data).length;
        const outlierPercentage = (outliers / data.length) * 100;
        
        return {
            consistencyIndex,
            stabilityIndex,
            variabilityIndex,
            outlierPercentage
        };
    }
    
    /**
     * Generate statistical summary for dataset
     * @param {Array<number>} data - Dataset to analyze
     * @param {boolean} includeAdvanced - Whether to include advanced statistics
     * @returns {Object} Statistical summary
     */
    function generateStatsSummary(data, includeAdvanced = false) {
        if (!data || data.length === 0) {
            return { count: 0 };
        }
        
        // Basic statistics
        const summary = {
            count: data.length,
            min: calculateMin(data),
            max: calculateMax(data),
            range: calculateRange(data),
            mean: calculateAverage(data),
            median: calculateMedian(data)
        };
        
        // Add percentiles
        summary.p5 = calculatePercentile(data, 0.05);
        summary.p25 = calculatePercentile(data, 0.25);
        summary.p75 = calculatePercentile(data, 0.75);
        summary.p95 = calculatePercentile(data, 0.95);
        
        // Add variability metrics
        summary.standardDeviation = calculateStandardDeviation(data);
        summary.variance = calculateVariance(data);
        summary.jitter = calculateJitter(data);
        
        // Add advanced statistics if requested
        if (includeAdvanced) {
            // Add consistency metrics
            Object.assign(summary, calculateConsistencyMetrics(data));
            
            // Add skewness (measure of asymmetry)
            const mean = summary.mean;
            const n = data.length;
            let sumCubed = 0;
            
            for (const value of data) {
                sumCubed += Math.pow(value - mean, 3);
            }
            
            const std3 = Math.pow(summary.standardDeviation, 3);
            summary.skewness = std3 !== 0 ? (sumCubed / n) / std3 : 0;
            
            // Add kurtosis (measure of "tailedness")
            let sumQuarted = 0;
            
            for (const value of data) {
                sumQuarted += Math.pow(value - mean, 4);
            }
            
            const std4 = Math.pow(summary.standardDeviation, 4);
            summary.kurtosis = std4 !== 0 ? (sumQuarted / n) / std4 - 3 : 0;
            
            // Add coefficient of variation
            summary.coefficientOfVariation = mean !== 0 ? (summary.standardDeviation / mean) * 100 : 0;
            
            // Add histogram data
            summary.histogram = createHistogram(data, 10);
        }
        
        return summary;
    }
    
    /**
     * Rate a metric based on thresholds
     * @param {number} value - Value to rate
     * @param {number} excellent - Threshold for excellent rating
     * @param {number} good - Threshold for good rating
     * @param {number} average - Threshold for average rating
     * @param {number} poor - Threshold for poor rating
     * @param {boolean} higherIsBetter - Whether higher values are better
     * @returns {Object} Rating information
     */
    function rateMetric(value, excellent, good, average, poor, higherIsBetter = false) {
        let rating, ratingClass, score;
        
        if (higherIsBetter) {
            // Higher values are better
            if (value >= excellent) {
                rating = 'Excellent';
                ratingClass = 'excellent';
                score = 100;
            } else if (value >= good) {
                rating = 'Good';
                ratingClass = 'good';
                score = 80 + (value - good) / (excellent - good) * 20;
            } else if (value >= average) {
                rating = 'Average';
                ratingClass = 'average';
                score = 60 + (value - average) / (good - average) * 20;
            } else if (value >= poor) {
                rating = 'Poor';
                ratingClass = 'poor';
                score = 40 + (value - poor) / (average - poor) * 20;
            } else {
                rating = 'Bad';
                ratingClass = 'bad';
                score = (value / poor) * 40;
            }
        } else {
            // Lower values are better
            if (value <= excellent) {
                rating = 'Excellent';
                ratingClass = 'excellent';
                score = 100;
            } else if (value <= good) {
                rating = 'Good';
                ratingClass = 'good';
                score = 80 + (good - value) / (good - excellent) * 20;
            } else if (value <= average) {
                rating = 'Average';
                ratingClass = 'average';
                score = 60 + (average - value) / (average - good) * 20;
            } else if (value <= poor) {
                rating = 'Poor';
                ratingClass = 'poor';
                score = 40 + (poor - value) / (poor - average) * 20;
            } else {
                rating = 'Bad';
                ratingClass = 'bad';
                score = 40 * Math.max(0, 1 - (value - poor) / poor);
            }
        }
        
        return {
            rating,
            ratingClass,
            score: Math.round(score)
        };
    }
    
    // Public API
    return {
        calculateAverage,
        calculateMedian,
        calculatePercentile,
        calculateStandardDeviation,
        calculateVariance,
        calculateMin,
        calculateMax,
        calculateRange,
        filterOutliers,
        applyNoiseReduction,
        createHistogram,
        calculateLinearRegression,
        calculateCorrelation,
        calculateJitter,
        detectFrameRate,
        detectVSync,
        detectAdaptiveSync,
        calculateConsistencyMetrics,
        generateStatsSummary,
        rateMetric
    };
})();