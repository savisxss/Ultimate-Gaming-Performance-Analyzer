/**
 * Ultimate Gaming Performance Analyzer
 * Translator Module
 * 
 * This module handles automatic language detection and UI translation.
 * Supports only English and Polish languages for maximum compatibility.
 */

const Translator = (function() {
    // Available languages with their codes and names
    const languages = {
        'en': { code: 'en', name: 'English', nativeName: 'English' },
        'pl': { code: 'pl', name: 'Polish', nativeName: 'Polski' }
    };

    // Default language (English)
    let currentLanguage = languages['en'];
    
    // Translation dictionaries
    const translations = {
        // English translations (default)
        'en': {
            // General
            'welcome': 'Welcome',
            'inputTests': 'Input Tests',
            'displayTests': 'Display Tests',
            'systemTests': 'System Tests',
            'gpuTests': 'GPU Tests',
            'audioTests': 'Audio Tests',
            'results': 'Results',
            'settings': 'Settings',
            'version': 'Version',
            'privacyPolicy': 'Privacy Policy',
            'warning': 'Warning',
            'browserWarning': 'For best results, use Chrome or Edge for this test.',
            'fullscreenWarning': 'Full-screen mode recommended for accurate results.',
            
            // Welcome screen
            'welcomeTitle': 'Welcome to Ultimate Gaming Performance Analyzer',
            'welcomeDesc': 'This tool will help you analyze your system\'s gaming performance by measuring various aspects that affect your gaming experience.',
            'systemOverview': 'System Overview',
            'availableTests': 'Available Tests',
            'inputLatency': 'Input Latency',
            'inputLatencyDesc': 'Test your mouse and keyboard response times',
            'displayPerformance': 'Display Performance',
            'displayPerformanceDesc': 'Analyze your monitor\'s refresh rate and response time',
            'systemLatency': 'System Latency',
            'systemLatencyDesc': 'Measure overall system responsiveness',
            'gpuPerformance': 'GPU Performance',
            'gpuPerformanceDesc': 'Test 3D rendering and graphics capabilities',
            'audioLatency': 'Audio Latency',
            'audioLatencyDesc': 'Check audio system response time',
            'startQuickTest': 'Start Quick Test Suite',
            
            // System info
            'cpu': 'CPU',
            'coresThreads': 'cores/threads',
            'memory': 'Memory',
            'display': 'Display',
            'pixelRatio': 'pixel ratio',
            'gpu': 'GPU',
            'browser': 'Browser',
            'platform': 'Platform',
            
            // Test headers
            'inputTestsTitle': 'Input Devices Latency Tests',
            'displayTestsTitle': 'Display Performance Tests',
            'systemTestsTitle': 'System Performance Tests',
            'gpuTestsTitle': 'GPU Performance Tests',
            'audioTestsTitle': 'Audio Performance Tests',
            
            // Test sections
            'mouseLatencyTest': 'Mouse Latency Test',
            'reactionTimeTest': 'Reaction Time Test',
            'keyboardLatencyTest': 'Keyboard Latency Test',
            'refreshRateTest': 'Refresh Rate Test',
            'motionClarityTest': 'Motion Clarity Test',
            'syncTest': 'VSync & Adaptive Sync Test',
            'systemLatencyTest': 'System Latency Test',
            'cpuTest': 'CPU Performance Test',
            'memoryTest': 'Memory Performance Test',
            'renderingTest': '3D Rendering Test',
            'shaderTest': 'Shader Complexity Test',
            'textureTest': 'Texture Streaming Test',
            'audioLatencyTest': 'Audio Latency Test',
            'audioQualityTest': 'Audio Quality Test',
            
            // Test badges
            'highPrecision': 'High Precision',
            'clickToPhoton': 'Click-to-Photon',
            'standardTest': 'Standard Test',
            'advancedTest': 'Advanced Test',
            'comprehensiveTest': 'Comprehensive Test',
            'multithreadingTest': 'Multithreading Test',
            'hardwareAccelerated': 'Hardware Accelerated',
            'gpuStressTest': 'GPU Stress Test',
            'visualTest': 'Visual Test',
            
            // Test descriptions
            'mouseTestDesc': 'This test measures your mouse response time and analyzes movement patterns.',
            'reactionTestDesc': 'This test measures how quickly you can react to visual stimuli and your click accuracy.',
            'keyboardTestDesc': 'This test measures the response time of your keyboard and key press consistency.',
            'refreshRateTestDesc': 'This test measures your monitor\'s actual refresh rate and frame consistency.',
            'motionClarityTestDesc': 'This test evaluates how clearly your monitor displays moving objects.',
            'syncTestDesc': 'This test detects if VSync, G-Sync, or FreeSync is active and working correctly.',
            'systemLatencyTestDesc': 'This test measures overall system responsiveness through various metrics.',
            'cpuTestDesc': 'This test evaluates how well your CPU handles multiple tasks simultaneously.',
            'memoryTestDesc': 'This test evaluates memory performance for gaming scenarios.',
            'renderingTestDesc': 'This test measures your GPU\'s 3D rendering capabilities using WebGL.',
            'shaderTestDesc': 'This test evaluates how your GPU handles complex shader operations.',
            'textureTestDesc': 'This test measures your GPU\'s texture handling capabilities.',
            'audioLatencyTestDesc': 'This test measures the delay between a trigger and audio playback.',
            'audioQualityTestDesc': 'This test evaluates your audio system\'s quality and capabilities.',
            
            // Test controls
            'startTest': 'Start Test',
            'stopTest': 'Stop Test',
            'testInProgress': 'Test in Progress',
            'pleaseWait': 'Please wait while the test is running...',
            'testError': 'Test Error',
            'errorOccurred': 'An error occurred during the test',
            
            // Results page
            'resultsTitle': 'Test Results & Analysis',
            'overallScore': 'Overall Gaming Performance Score',
            'scoreOutOf': 'out of 100',
            'resultsBreakdown': 'Results Breakdown',
            'recommendations': 'Recommendations',
            'exportResults': 'Export Results',
            'shareResults': 'Share Results',
            'copiedToClipboard': 'Results copied to clipboard!',
            'failedToCopy': 'Failed to copy results to clipboard',
            
            // Results table
            'testCategory': 'Test Category',
            'yourResult': 'Your Result',
            'casualGamer': 'Casual Gamer',
            'competitiveGamer': 'Competitive Gamer',
            'proGamer': 'Pro Gamer',
            'eSportsAthlete': 'E-Sports Athlete',
            
            // Result parameters
            'mouseLatency': 'Mouse Latency',
            'reactionTime': 'Reaction Time',
            'keyboardLatency': 'Keyboard Latency',
            'refreshRate': 'Display Refresh Rate',
            'systemLatency': 'System Latency',
            'gpuPerformance': 'GPU Performance',
            'audioLatency': 'Audio Latency',
            
            // Settings page
            'settingsTitle': 'Test Settings',
            'testAccuracy': 'Test Accuracy',
            'highPrecisionMode': 'High Precision Mode',
            'highPrecisionTooltip': 'Enables more precise measurements but may affect performance',
            'advancedStats': 'Advanced Statistical Analysis',
            'advancedStatsTooltip': 'Provides more detailed statistical analysis of test results',
            'filterOutliers': 'Filter Outlier Values',
            'filterOutliersTooltip': 'Removes extreme values from calculations for more consistent results',
            'sampleCount': 'System Test Sample Count',
            'sampleCountTooltip': 'Higher sample count increases accuracy but takes longer to complete',
            'displaySettings': 'Display Settings',
            'darkMode': 'Dark Mode',
            'animations': 'Enable Animations',
            'colorTheme': 'Color Theme',
            'defaultTheme': 'Default',
            'gamingTheme': 'Gaming',
            'professionalTheme': 'Professional',
            'highContrastTheme': 'High Contrast',
            'advancedSettings': 'Advanced Settings',
            'debugMode': 'Debug Mode',
            'debugModeTooltip': 'Displays additional technical information for debugging',
            'noiseReduction': 'Noise Reduction Algorithm',
            'noiseReductionNone': 'None',
            'noiseReductionAverage': 'Average',
            'noiseReductionKalman': 'Kalman Filter',
            'noiseReductionMedian': 'Median Filter',
            'gpuAcceleration': 'Force GPU Acceleration',
            'gpuAccelerationTooltip': 'Attempts to use GPU acceleration for all tests',
            'resetSettings': 'Reset All Settings',
            'reset': 'Reset',
            'confirmResetSettings': 'Are you sure you want to reset all settings to default?',
            'settingsReset': 'Settings have been reset to default values',
            
            // Recommendations
            'mouse': 'Mouse',
            'mouseHighLatency': 'Mouse latency is high. Consider upgrading to a gaming mouse with a higher polling rate (1000Hz+).',
            'mouseAverageLatency': 'Mouse latency is average. Check polling rate settings in your mouse software.',
            'mousePollingRate': 'Mouse Polling Rate',
            'mouseLowPollingRate': 'Your mouse has a low polling rate. For competitive gaming, 1000Hz or higher is recommended.',
            'keyboard': 'Keyboard',
            'keyboardHighLatency': 'Keyboard latency is high. Consider upgrading to a mechanical gaming keyboard with low activation force.',
            'keyboardAverageLatency': 'Keyboard latency is average. For better performance, consider a mechanical keyboard optimized for gaming.',
            'monitor': 'Monitor',
            'monitorLowRefreshRate': 'A 60Hz monitor was detected. For competitive gaming, consider upgrading to at least 144Hz.',
            'monitorAverageRefreshRate': 'Your monitor has a decent refresh rate. For professional gaming, 240Hz or higher is recommended.',
            'monitorJitter': 'Display Consistency',
            'monitorHighJitter': 'High display jitter detected. Enable G-Sync/FreeSync if available, or update graphics drivers.',
            'system': 'System',
            'systemHighLatency': 'High system latency detected. Close background applications and disable visual effects.',
            'systemAverageLatency': 'System latency is average. Consider optimizing background processes for gaming.',
            'cpu': 'CPU',
            'cpuLowPerformance': 'CPU single-thread performance is low, which affects gaming. Consider upgrading or overclocking your CPU.',
            'cpuThreads': 'CPU Threading',
            'cpuLowThreadCount': 'Low CPU thread count detected. Modern games benefit from 6 or more threads.',
            'gpu': 'GPU',
            'gpuLowPerformance': 'GPU performance is below average for gaming. Consider upgrading your graphics card.',
            'gpuAveragePerformance': 'GPU performance is average. For better frame rates, consider upgrading your graphics card.',
            'audio': 'Audio',
            'audioHighLatency': 'High audio latency detected. Check audio drivers and settings for gaming mode.',
            'generalSettings': 'General Settings',
            'generalSettingsRecommendation': 'Enable "Game Mode" in your operating system settings and disable unnecessary visual effects.',
            'drivers': 'Drivers',
            'driversRecommendation': 'Ensure all drivers, especially GPU drivers, are up to date for optimal gaming performance.',
            'gameSettings': 'Game Settings',
            'gameSettingsRecommendation': 'In game settings, prioritize high frame rate over visual quality for competitive gaming.',
            
            // Mouse test specific
            'mouseTestInstructions': 'Move your mouse within this area. The test will track movement patterns and response times.',
            'moveMouseInstructions': 'Continue moving your mouse in different patterns to gather data.',
            'mouseTip': 'For best gaming performance, use a mouse with at least 1000Hz polling rate on a quality mouse pad.',
            'mouseInterpretation': 'Lower latency and higher polling rate indicate better mouse performance for gaming.',
            
            // Click test specific
            'clickTestInstructions': 'Click the targets as quickly as possible when they appear.',
            'pressKeysInstructions': 'Press various keys on your keyboard to test response times.',
            'click': 'Click',
            'tooSlow': 'Too slow!',
            'missed': 'Missed!',
            'pressed': 'Pressed',
            'hits': 'Hits',
            'misses': 'Misses',
            'clickTip': 'Competitive gamers typically have reaction times under 250ms. Regular training can improve your reaction time.',
            'clickInterpretation': 'Lower reaction times indicate better reflexes for competitive gaming. Aim for consistency in your responses.',
            
            // Keyboard test specific
            'keyboardTestInstructions': 'Press various keys on your keyboard. The test will measure response times and consistency.',
            'pressAnyKey': 'Press any key',
            'keyPressTime': 'Key Press Time',
            'keyboardConsistency': 'Keyboard Consistency',
            'movementConsistency': 'Movement Consistency',
            'keyStability': 'Key Stability',
            'mostUsedKey': 'Most Used Key',
            'times': 'times',
            'keyboardTip': 'Mechanical keyboards typically offer better response times than membrane keyboards.',
            'keyboardInterpretation': 'Lower key press times indicate a more responsive keyboard, which is beneficial for gaming.',
            'keyPressTimeRange': 'Key Press Time Range',
            
            // Keyboard types
            'premiumMechanical': 'Premium Mechanical Gaming Keyboard',
            'gamingMechanical': 'Gaming Mechanical Keyboard',
            'hybridOfficeMechanical': 'Hybrid/Office Mechanical Keyboard',
            'gamingMembrane': 'Gaming Membrane Keyboard',
            'standardMembrane': 'Standard Membrane Keyboard',
            
            // Display test specific
            'refreshTestInstructions': 'This test will measure your monitor\'s refresh rate and frame consistency.',
            'motionTestInstructions': 'This test evaluates how clearly your monitor displays moving objects.',
            'syncTestInstructions': 'This test detects if VSync or adaptive sync technologies are active on your system.',
            'refreshInterpretation': 'Higher refresh rates and lower jitter provide smoother gameplay and potentially lower input lag.',
            'motionInterpretation': 'Better motion clarity allows you to see moving objects more clearly, which is crucial in fast-paced games.',
            'syncInterpretation': 'Proper sync technologies help eliminate screen tearing and provide smoother gameplay experience.',
            'frameTime': 'Frame Time',
            'jitter': 'Jitter',
            'refreshTip': 'For competitive gaming, look for monitors with at least 144Hz refresh rate and adaptive sync technology.',
            'motionTestLoading': 'Loading motion test...',
            'speed': 'Speed',
            'rateClarity': 'Rate the clarity of the moving object',
            'refreshRateTest': 'Refresh Rate Test',
            
            // System test specific
            'systemTestInstructions': 'This test will measure your system\'s responsiveness and latency.',
            'cpuTestInstructions': 'This test will evaluate your CPU\'s performance in both single and multi-threaded scenarios.',
            'memoryTestInstructions': 'This test will evaluate your memory\'s performance in gaming-relevant scenarios.',
            'systemTestStarted': 'System latency test started...',
            'measuringTimingPrecision': 'Measuring timing precision...',
            'measuringRafLatency': 'Measuring display refresh latency...',
            'measuringEventLoopLatency': 'Measuring system event loop latency...',
            'calculatingResults': 'Calculating final results...',
            'systemInterpretation': 'Lower system latency provides more responsive gameplay and potentially better gaming performance.',
            'systemTip': 'Close background applications and disable unnecessary visual effects to minimize system latency.',
            
            // CPU specific
            'testingSingleThreadPerformance': 'Testing single-thread performance...',
            'testingSortingPerformance': 'Testing sorting performance...',
            'testingPrimeCalculation': 'Testing prime number calculation...',
            'testingMultithreading': 'Testing multi-threading capabilities...',
            'simulatedCpuUsage': 'Simulated CPU Usage',
            'cpuInterpretation': 'Higher CPU performance, especially single-thread, is crucial for gaming as most games don\'t fully utilize all cores.',
            'singleThreadPerformance': 'Single Thread Performance',
            'multiThreadPerformance': 'Multi-Thread Performance',
            'detectedCoresThreads': 'Detected Cores/Threads',
            'points': 'points',
            
            // CPU categories
            'premiumGamingCpu': 'Premium Gaming CPU',
            'highEndGamingCpu': 'High-End Gaming CPU',
            'midRangeGamingCpu': 'Mid-Range Gaming CPU',
            'entryLevelGamingCpu': 'Entry-Level Gaming CPU',
            'generalPurposeCpu': 'General Purpose CPU',
            
            // Gaming capability
            'excellentForAllGames': 'Excellent for All Games',
            'veryGood': 'Very Good',
            'good': 'Good',
            'basic': 'Basic',
            'limited': 'Limited',
            
            // CPU recommendations
            'cpuExcellentRecommendation': 'Your CPU is excellent for gaming. No upgrades needed at this time.',
            'cpuVeryGoodRecommendation': 'Your CPU performs very well for most games. Consider upgrades only for the most demanding titles.',
            'cpuGoodRecommendation': 'Your CPU performs well for most games. Consider upgrades for better performance in CPU-intensive titles.',
            'cpuBasicRecommendation': 'Your CPU provides basic gaming performance. Consider upgrading for better gaming experience.',
            'cpuLimitedRecommendation': 'Your CPU has limited gaming capabilities. Consider upgrading for any modern gaming.',
            
            // Memory test specific
            'testingMemoryAllocation': 'Testing memory allocation speed...',
            'testingMemoryAccess': 'Testing memory access speed...',
            'testingLargeObjects': 'Testing large object handling...',
            'testingGarbageCollection': 'Testing memory management performance...',
            'memoryInterpretation': 'Faster memory operations reduce loading times and improve performance in memory-intensive games.',
            'memoryLowPerformanceRecommendation': 'Your memory performance is below average. Consider upgrading to faster RAM or adding more capacity.',
            'memoryAveragePerformanceRecommendation': 'Your memory performance is adequate. For better gaming performance, consider faster RAM with tighter timings.',
            'memoryHighPerformanceRecommendation': 'Your memory performance is good. No immediate upgrades needed for gaming.',
            'memoryLowGcRecommendation': 'Poor memory management detected. Close background applications before gaming sessions.',
            
            // GPU test specific
            'renderingTestInstructions': 'This test will evaluate your GPU\'s 3D rendering capabilities.',
            'shaderTestInstructions': 'This test will evaluate how your GPU handles different shader complexities.',
            'textureTestInstructions': 'This test will evaluate your GPU\'s texture handling capabilities.',
            'renderingInterpretation': 'Higher FPS and stability indicate better GPU performance for gaming.',
            'shaderInterpretation': 'Better handling of complex shaders indicates a more capable GPU for modern games with advanced visual effects.',
            'textureInterpretation': 'Faster texture handling indicates better performance in games with high-resolution textures.',
            'renderingTestRunning': 'Rendering test running... Please wait.',
            'shaderTestRunning': 'Shader complexity test running... Please wait.',
            'textureTestRunning': 'Texture streaming test running... Please wait.',
            'webglNotSupported': 'WebGL Not Supported',
            'webglRequiredForTest': 'Your browser or graphics hardware does not support WebGL, which is required for this test.',
            'loadingTextures': 'Loading textures...',
            'testingTextureSize': 'Testing texture size',
            
            // GPU recommendations
            'shaderLowPerformanceRecommendation': 'Your GPU struggles with complex shaders. Consider upgrading your graphics card for modern games.',
            'shaderAveragePerformanceRecommendation': 'Your GPU handles shaders adequately. For better visual effects, consider a more powerful GPU.',
            'shaderHighPerformanceRecommendation': 'Your GPU handles complex shaders well. No immediate upgrades needed for shader performance.',
            'shaderHighDropRecommendation': 'Large performance drop detected with complex shaders. Lower shader quality settings in games.',
            'shaderModerateDropRecommendation': 'Moderate performance drop with complex shaders. Consider optimizing shader settings in demanding games.',
            'textureLowPerformanceRecommendation': 'Your GPU has below average texture handling. Consider upgrading for games with high-res textures.',
            'textureAveragePerformanceRecommendation': 'Your GPU has adequate texture handling. For better performance with high-res textures, consider a GPU with more VRAM.',
            'textureHighPerformanceRecommendation': 'Your GPU handles textures well. No immediate upgrades needed for texture performance.',
            'textureSizeLimitationRecommendation': 'Your GPU has limited maximum texture size. You may experience issues with high-res textures in games.',
            
            // Audio test specific
            'audioLatencyTestInstructions': 'This test will measure the delay between audio triggering and playback.',
            'audioQualityTestInstructions': 'This test will evaluate the quality and capabilities of your audio system.',
            'audioLatencyTestRunning': 'Audio latency test running... Please wait.',
            'audioQualityTestRunning': 'Audio quality test running... Please wait.',
            'audioContextError': 'Error initializing audio context. Please ensure audio is enabled in your browser.',
            'measuringLatency': 'Measuring audio latency...',
            'measuredLatency': 'Measured latency',
            'readyToStart': 'Ready to start test',
            'playTestTone': 'Play Test Tone',
            'stopTestTone': 'Stop Test Tone',
            'testCompleted': 'Test completed',
            'testStopped': 'Test stopped',
            'playFrequencySweep': 'Play Frequency Sweep',
            'testDynamicRange': 'Test Dynamic Range',
            'selectQualityTest': 'Select a quality test to run',
            'frequencySweepComplete': 'Frequency sweep complete',
            'dynamicRangeTestComplete': 'Dynamic range test complete',
            'dynamicRange': 'Dynamic Range',
            
            // Audio test results
            'audioLatencyResults': 'Audio Latency Results',
            'audioQualityResults': 'Audio Quality Results',
            'averageLatency': 'Average Latency',
            'minimumLatency': 'Minimum Latency',
            'maximumLatency': 'Maximum Latency',
            'latencyJitter': 'Latency Jitter',
            'sampleCount': 'Sample Count',
            'audioLatencyInterpretation': 'Lower audio latency provides better synchronization between visuals and sound in games.',
            'audioHighLatencyRecommendation': 'Your audio latency is high. Check audio drivers and settings, or consider a dedicated gaming headset/sound card.',
            'audioMediumLatencyRecommendation': 'Your audio latency is moderate. For competitive gaming, consider optimizing audio settings.',
            'audioLowLatencyRecommendation': 'Your audio latency is good. No immediate improvements needed for gaming.',
            'audioHighJitterRecommendation': 'High audio jitter detected. This can cause inconsistent audio. Consider updating audio drivers.',
            
            // General and cross-test items
            'parameter': 'Parameter',
            'value': 'Value',
            'rating': 'Rating',
            'interpretation': 'Interpretation',
            'tip': 'Tip',
            'latencyMs': 'Latency (ms)',
            'timeMs': 'Time (ms)',
            'frequency': 'Frequency',
            'performancePoints': 'Performance Points',
            'frame': 'Frame',
            'sampleNumber': 'Sample Number',
            'insufficientData': 'Insufficient Data',
            'needMoreMouseData': 'Not enough mouse movement data collected. Please try again and move your mouse more.',
            'needMoreClickData': 'Not enough click data collected. Please try again and click on more targets.',
            'needMoreKeyboardData': 'Not enough keyboard data collected. Please try again and press more keys.',
            'needMoreRefreshData': 'Not enough display data collected. Please try again for more accurate results.',
            'needMoreMotionData': 'Not enough motion clarity data collected. Please rate all motion tests.',
            'needMoreRenderingData': 'Not enough rendering data collected. Please let the test run longer.',
            'needMoreShaderData': 'Not enough shader performance data collected. Please let the test run longer.',
            'notEnoughData': 'Not enough data was collected to provide accurate results.',
            'noResultsAvailable': 'No test results are available. Please run the test again.',
            'frameTimeMs': 'Frame Time (ms)',
            'jitterMs': 'Jitter (ms)',
            'reactionTimeMs': 'Reaction Time (ms)',
            'loadTimeMs': 'Load Time (ms)',
            'attemptNumber': 'Attempt Number',
            
            // Rating levels
            'excellent': 'Excellent',
            'good': 'Good',
            'average': 'Average',
            'poor': 'Poor',
            'bad': 'Bad',
            
            // Yes/No
            'yes': 'Yes',
            'no': 'No',
            
            // Additional keys from display.js
            'framesToRender': 'Frames to render',
            'apiPrecision': 'API Precision',
            'rafLatency': 'RAF Latency',
            'eventLoopLatency': 'Event Loop Latency',
            'totalLatency': 'Total Latency',
            'timingApiPrecision': 'Timing API Precision',
            'rafVariability': 'RAF Variability',
            'eventLoopVariability': 'Event Loop Variability',
            'systemPerformanceIndex': 'System Performance Index',
            'systemBottleneck': 'System Bottleneck',
            'timingPrecision': 'Timing Precision',
            'totalSystemLatency': 'Total System Latency',
            'textClarity': 'Text Clarity',
            'objectSharpness': 'Object Sharpness',
            'motionBlur': 'Motion Blur',
            'ghosting': 'Ghosting',
            'overall': 'Overall',
            'textClarityTest': 'Text Clarity Test',
            'objectSharpnessTest': 'Object Sharpness Test',
            'motionBlurTest': 'Motion Blur Test',
            'motionGhostingTest': 'Ghosting Test',
            'motionOverallTest': 'Overall Motion Test',
            'motionClarityScore': 'Motion Clarity Score',
            'ghostingRating': 'Ghosting Rating',
            'overallRating': 'Overall Rating',
            'motionBadRecommendation': 'Your display has poor motion clarity. Consider a monitor with faster response time and higher refresh rate.',
            'motionAverageRecommendation': 'Your display has average motion clarity. Enabling gaming mode or overdrive settings may help.',
            'motionGoodRecommendation': 'Your display has good motion clarity. Suitable for most gaming scenarios.',
            'motionBlurRecommendation': 'Significant motion blur detected. Look for monitors with better response times or blur reduction technology.',
            'ghostingRecommendation': 'Ghosting artifacts detected. Try adjusting overdrive settings on your monitor for better clarity.',
            'vSync': 'VSync',
            'adaptiveSync': 'Adaptive Sync',
            'tearingLevel': 'Tearing Level',
            'frameTimeConsistency': 'Frame Time Consistency',
            'displaySyncQuality': 'Display Sync Quality',
            'recommendedSyncMode': 'Recommended Sync Mode',
            'testingVSync': 'Testing VSync...',
            'testingAdaptiveSync': 'Testing Adaptive Sync...',
            'testingTearing': 'Testing Screen Tearing...',
            'testVSync': 'Test VSync',
            'testAdaptiveSync': 'Test Adaptive Sync',
            'testScreenTearing': 'Test Screen Tearing',
            'analyzing': 'Analyzing',
            'syncTestRunning': 'Sync test running...',
            'vSyncDetected': 'VSync detected',
            'vSyncNotDetected': 'VSync not detected',
            'adaptiveSyncDetected': 'Adaptive Sync detected',
            'adaptiveSyncNotDetected': 'Adaptive Sync not detected',
            'tearingDetected': 'Screen tearing detected',
            'tearingNotDetected': 'No screen tearing detected',
            'adaptiveSyncRecommendation': 'Adaptive Sync (G-Sync/FreeSync) is working correctly. This is optimal for gaming.',
            'vSyncRecommendation': 'VSync is enabled but Adaptive Sync not detected. Consider enabling G-Sync/FreeSync if supported.',
            'tearingRecommendation': 'Screen tearing detected. Enable VSync or preferably G-Sync/FreeSync if supported.',
            'frameTimeVariabilityRecommendation': 'High frame time variability detected. This can cause stuttering. Try limiting FPS or enabling sync technologies.',
            'keepAdaptiveSyncRecommendation': 'Keep using Adaptive Sync (G-Sync/FreeSync) for optimal gaming experience.',
            'highRefreshNoVSyncRecommendation': 'With your high refresh rate, disabling VSync may reduce input lag for competitive gaming.',
            'enableAdaptiveSyncRecommendation': 'Your high refresh rate monitor would benefit from enabling G-Sync/FreeSync if supported.',
            'highRefreshCurrentSettingRecommendation': 'Your current high refresh rate setup is well configured for gaming.',
            'lowRefreshVSyncRecommendation': 'At 60Hz, enabling VSync can reduce tearing but will increase input lag.',
            'lowRefreshAdaptiveSyncRecommendation': 'For your 60Hz display, consider enabling G-Sync/FreeSync if supported to reduce input lag while preventing tearing.',
            'midRefreshUpgradeRecommendation': 'Consider upgrading to a 144Hz+ monitor with Adaptive Sync for better gaming experience.',

            // Additional keys from other modules
            'latencyDistribution': 'Latency Distribution',
            'latencyRange': 'Latency Range',
            'reactionTimeDistribution': 'Reaction Time Distribution',
            'fpsDistribution': 'FPS Distribution',
            'fpsRange': 'FPS Range',
            'fibonacciTest': 'Fibonacci Test',
            'sortingTest': 'Sorting Test',
            'primeNumbersTest': 'Prime Numbers Test',
            'cpuCategory': 'CPU Category',
            'gamingCapability': 'Gaming Capability',
            'overallMemoryPerformance': 'Overall Memory Performance',
            'memoryAllocationSpeed': 'Memory Allocation Speed',
            'memoryAccessSpeed': 'Memory Access Speed',
            'largeObjectHandling': 'Large Object Handling',
            'garbageCollectionPerformance': 'Garbage Collection Performance',
            'averageFrameTime': 'Average Frame Time',
            'measuredFPS': 'Measured FPS',
            'frameTimeJitter': 'Frame Time Jitter',
            'minimumFrameTime': 'Minimum Frame Time',
            'maximumFrameTime': 'Maximum Frame Time',
            'detectedRefreshRate': 'Detected Refresh Rate',
            'refreshTestResults': 'Refresh Rate Test Results',
            'motionTestResults': 'Motion Clarity Test Results',
            'syncTestResults': 'Sync Test Results',
            'syncQualityScore': 'Sync Quality Score',
            'overallQualityScore': 'Overall Quality Score',
            'frequencyResponse': 'Frequency Response',
            'distortion': 'Distortion',
            'overallQuality': 'Overall Quality',
            'audioQuality': 'Audio Quality',
            'audioLowQualityRecommendation': 'Your audio quality is below average. Consider upgrading your audio hardware for better gaming experience.',
            'audioMediumQualityRecommendation': 'Your audio quality is adequate. For better gaming audio, consider a gaming headset or external sound card.',
            'audioHighQualityRecommendation': 'Your audio quality is good. No immediate upgrades needed for gaming audio.',
            'audioPoorFrequencyRecommendation': 'Poor frequency response detected. Using an equalizer may help balance your audio output.',
            'audioPoorDynamicRangeRecommendation': 'Limited dynamic range detected. This may affect your ability to hear subtle audio cues in games.',
            'audioQualityInterpretation': 'Better audio quality allows you to hear subtle game audio cues and enhances the overall gaming experience.'
        },
        
        // Polish translations
        'pl': {
            // General
            'welcome': 'Witaj',
            'inputTests': 'Testy wejścia',
            'displayTests': 'Testy wyświetlacza',
            'systemTests': 'Testy systemu',
            'gpuTests': 'Testy GPU',
            'audioTests': 'Testy audio',
            'results': 'Wyniki',
            'settings': 'Ustawienia',
            'version': 'Wersja',
            'privacyPolicy': 'Polityka prywatności',
            'warning': 'Ostrzeżenie',
            'browserWarning': 'Dla najlepszych wyników używaj przeglądarki Chrome lub Edge.',
            'fullscreenWarning': 'Zalecamy tryb pełnoekranowy dla dokładnych wyników.',
            
            // Welcome screen
            'welcomeTitle': 'Witaj w Ultimate Gaming Performance Analyzer',
            'welcomeDesc': 'To narzędzie pomoże ci przeanalizować wydajność twojego systemu w grach, mierząc różne aspekty wpływające na jakość rozgrywki.',
            'systemOverview': 'Przegląd systemu',
            'availableTests': 'Dostępne testy',
            'inputLatency': 'Opóźnienie wejścia',
            'inputLatencyDesc': 'Testuje czas reakcji myszy i klawiatury',
            'displayPerformance': 'Wydajność wyświetlacza',
            'displayPerformanceDesc': 'Analizuje częstotliwość odświeżania i czas reakcji monitora',
            'systemLatency': 'Opóźnienie systemowe',
            'systemLatencyDesc': 'Mierzy ogólną responsywność systemu',
            'gpuPerformance': 'Wydajność GPU',
            'gpuPerformanceDesc': 'Testuje możliwości renderowania 3D i grafiki',
            'audioLatency': 'Opóźnienie audio',
            'audioLatencyDesc': 'Sprawdza czas reakcji systemu audio',
            'startQuickTest': 'Uruchom szybki test',
            
            // System info
            'cpu': 'Procesor',
            'coresThreads': 'rdzeni/wątków',
            'memory': 'Pamięć',
            'display': 'Wyświetlacz',
            'pixelRatio': 'współczynnik pikseli',
            'gpu': 'Karta graficzna',
            'browser': 'Przeglądarka',
            'platform': 'Platforma',
            
            // Test headers
            'inputTestsTitle': 'Testy opóźnienia urządzeń wejściowych',
            'displayTestsTitle': 'Testy wydajności wyświetlacza',
            'systemTestsTitle': 'Testy wydajności systemu',
            'gpuTestsTitle': 'Testy wydajności GPU',
            'audioTestsTitle': 'Testy wydajności audio',
            
            // Test sections
            'mouseLatencyTest': 'Test opóźnienia myszy',
            'reactionTimeTest': 'Test czasu reakcji',
            'keyboardLatencyTest': 'Test opóźnienia klawiatury',
            'refreshRateTest': 'Test częstotliwości odświeżania',
            'motionClarityTest': 'Test czytelności ruchu',
            'syncTest': 'Test VSync i Adaptive Sync',
            'systemLatencyTest': 'Test opóźnienia systemowego',
            'cpuTest': 'Test wydajności procesora',
            'memoryTest': 'Test wydajności pamięci',
            'renderingTest': 'Test renderowania 3D',
            'shaderTest': 'Test złożoności shaderów',
            'textureTest': 'Test streamingu tekstur',
            'audioLatencyTest': 'Test opóźnienia audio',
            'audioQualityTest': 'Test jakości audio',
            
            // Test badges
            'highPrecision': 'Wysoka precyzja',
            'clickToPhoton': 'Click-to-Photon',
            'standardTest': 'Test standardowy',
            'advancedTest': 'Test zaawansowany',
            'comprehensiveTest': 'Test kompleksowy',
            'multithreadingTest': 'Test wielowątkowości',
            'hardwareAccelerated': 'Akceleracja sprzętowa',
            'gpuStressTest': 'Test obciążenia GPU',
            'visualTest': 'Test wizualny',
            
            // Test descriptions
            'mouseTestDesc': 'Ten test mierzy czas reakcji myszy i analizuje wzorce ruchu.',
            'reactionTestDesc': 'Ten test mierzy jak szybko reagujesz na bodźce wizualne i twoją dokładność kliknięć.',
            'keyboardTestDesc': 'Ten test mierzy czas reakcji klawiatury i spójność naciśnięć klawiszy.',
            'refreshRateTestDesc': 'Ten test mierzy rzeczywistą częstotliwość odświeżania monitora i spójność klatek.',
            'motionClarityTestDesc': 'Ten test ocenia jak wyraźnie twój monitor wyświetla poruszające się obiekty.',
            'syncTestDesc': 'Ten test wykrywa czy VSync, G-Sync lub FreeSync jest aktywny i działa poprawnie.',
            'systemLatencyTestDesc': 'Ten test mierzy ogólną responsywność systemu za pomocą różnych metryk.',
            'cpuTestDesc': 'Ten test ocenia jak dobrze twój procesor radzi sobie z wieloma zadaniami jednocześnie.',
            'memoryTestDesc': 'Ten test ocenia wydajność pamięci w scenariuszach gamingowych.',
            'renderingTestDesc': 'Ten test mierzy możliwości renderowania 3D twojej karty graficznej za pomocą WebGL.',
            'shaderTestDesc': 'Ten test ocenia jak twoja karta graficzna radzi sobie ze złożonymi operacjami shaderów.',
            'textureTestDesc': 'Ten test mierzy możliwości obsługi tekstur twojej karty graficznej.',
            'audioLatencyTestDesc': 'Ten test mierzy opóźnienie między wyzwalaczem a odtwarzaniem dźwięku.',
            'audioQualityTestDesc': 'Ten test ocenia jakość i możliwości twojego systemu audio.',
            
            // Test controls
            'startTest': 'Rozpocznij test',
            'stopTest': 'Zatrzymaj test',
            'testInProgress': 'Test w toku',
            'pleaseWait': 'Proszę czekać podczas trwania testu...',
            'testError': 'Błąd testu',
            'errorOccurred': 'Wystąpił błąd podczas testu',
            
            // Results page
            'resultsTitle': 'Wyniki testów i analiza',
            'overallScore': 'Ogólny wynik wydajności gamingowej',
            'scoreOutOf': 'na 100',
            'resultsBreakdown': 'Szczegółowe wyniki',
            'recommendations': 'Rekomendacje',
            'exportResults': 'Eksportuj wyniki',
            'shareResults': 'Udostępnij wyniki',
            'copiedToClipboard': 'Wyniki skopiowane do schowka!',
            'failedToCopy': 'Nie udało się skopiować wyników do schowka',
            
            // Results table
            'testCategory': 'Kategoria testu',
            'yourResult': 'Twój wynik',
            'casualGamer': 'Gracz casual',
            'competitiveGamer': 'Gracz rywalizacyjny',
            'proGamer': 'Gracz profesjonalny',
            'eSportsAthlete': 'E-sportowiec',
            
            // Result parameters
            'mouseLatency': 'Opóźnienie myszy',
            'reactionTime': 'Czas reakcji',
            'keyboardLatency': 'Opóźnienie klawiatury',
            'refreshRate': 'Częstotliwość odświeżania',
            'systemLatency': 'Opóźnienie systemowe',
            'gpuPerformance': 'Wydajność GPU',
            'audioLatency': 'Opóźnienie audio',
            
            // Settings page
            'settingsTitle': 'Ustawienia testów',
            'testAccuracy': 'Dokładność testów',
            'highPrecisionMode': 'Tryb wysokiej precyzji',
            'highPrecisionTooltip': 'Umożliwia bardziej precyzyjne pomiary, ale może wpłynąć na wydajność',
            'advancedStats': 'Zaawansowana analiza statystyczna',
            'advancedStatsTooltip': 'Zapewnia bardziej szczegółową analizę statystyczną wyników testów',
            'filterOutliers': 'Filtrowanie wartości odstających',
            'filterOutliersTooltip': 'Usuwa skrajne wartości z obliczeń dla bardziej spójnych wyników',
            'sampleCount': 'Liczba próbek testu systemowego',
            'sampleCountTooltip': 'Większa liczba próbek zwiększa dokładność, ale wydłuża czas testu',
            'displaySettings': 'Ustawienia wyświetlania',
            'darkMode': 'Tryb ciemny',
            'animations': 'Włącz animacje',
            'colorTheme': 'Motyw kolorystyczny',
            'defaultTheme': 'Domyślny',
            'gamingTheme': 'Gamingowy',
            'professionalTheme': 'Profesjonalny',
            'highContrastTheme': 'Wysoki kontrast',
            'advancedSettings': 'Ustawienia zaawansowane',
            'debugMode': 'Tryb debugowania',
            'debugModeTooltip': 'Wyświetla dodatkowe informacje techniczne do debugowania',
            'noiseReduction': 'Algorytm redukcji szumów',
            'noiseReductionNone': 'Brak',
            'noiseReductionAverage': 'Uśrednianie',
            'noiseReductionKalman': 'Filtr Kalmana',
            'noiseReductionMedian': 'Filtr medianowy',
            'gpuAcceleration': 'Wymuś akcelerację GPU',
            'gpuAccelerationTooltip': 'Próbuje użyć akceleracji GPU dla wszystkich testów',
            'resetSettings': 'Zresetuj wszystkie ustawienia',
            'reset': 'Reset',
            'confirmResetSettings': 'Czy na pewno chcesz zresetować wszystkie ustawienia do wartości domyślnych?',
            'settingsReset': 'Ustawienia zostały zresetowane do wartości domyślnych',
            
            // Recommendations
            'mouse': 'Mysz',
            'mouseHighLatency': 'Opóźnienie myszy jest wysokie. Rozważ upgrade do myszy gamingowej z wyższym polling rate (1000Hz+).',
            'mouseAverageLatency': 'Opóźnienie myszy jest przeciętne. Sprawdź ustawienia polling rate w oprogramowaniu myszy.',
            'mousePollingRate': 'Częstotliwość próbkowania myszy',
            'mouseLowPollingRate': 'Twoja mysz ma niską częstotliwość próbkowania. Dla gier rywalizacyjnych zalecane jest 1000Hz lub wyższe.',
            'keyboard': 'Klawiatura',
            'keyboardHighLatency': 'Opóźnienie klawiatury jest wysokie. Rozważ upgrade do mechanicznej klawiatury gamingowej z niską siłą aktywacji.',
            'keyboardAverageLatency': 'Opóźnienie klawiatury jest przeciętne. Dla lepszej wydajności rozważ klawiaturę mechaniczną zoptymalizowaną do gier.',
            'monitor': 'Monitor',
            'monitorLowRefreshRate': 'Wykryto monitor 60Hz. Dla gier rywalizacyjnych rozważ upgrade do przynajmniej 144Hz.',
            'monitorAverageRefreshRate': 'Twój monitor ma dobrą częstotliwość odświeżania. Dla profesjonalnego gamingu zaleca się 240Hz lub wyższe.',
            'monitorJitter': 'Spójność wyświetlania',
            'monitorHighJitter': 'Wykryto wysoki jitter wyświetlania. Włącz G-Sync/FreeSync jeśli dostępne lub zaktualizuj sterowniki graficzne.',
            'system': 'System',
            'systemHighLatency': 'Wykryto wysokie opóźnienie systemowe. Zamknij aplikacje działające w tle i wyłącz efekty wizualne.',
            'systemAverageLatency': 'Opóźnienie systemowe jest przeciętne. Rozważ optymalizację procesów w tle dla gier.',
            'cpu': 'Procesor',
            'cpuLowPerformance': 'Wydajność jednowątkowa procesora jest niska, co wpływa na gry. Rozważ upgrade lub podkręcenie procesora.',
            'cpuThreads': 'Wątki procesora',
            'cpuLowThreadCount': 'Wykryto niską liczbę wątków procesora. Nowoczesne gry korzystają z 6 lub więcej wątków.',
            'gpu': 'Karta graficzna',
            'gpuLowPerformance': 'Wydajność GPU jest poniżej średniej dla gier. Rozważ upgrade karty graficznej.',
            'gpuAveragePerformance': 'Wydajność GPU jest przeciętna. Dla lepszych klatek na sekundę rozważ upgrade karty graficznej.',
            'audio': 'Audio',
            'audioHighLatency': 'Wykryto wysokie opóźnienie audio. Sprawdź sterowniki audio i ustawienia trybu dla gier.',
            'generalSettings': 'Ustawienia ogólne',
            'generalSettingsRecommendation': 'Włącz "Tryb gry" w ustawieniach systemu operacyjnego i wyłącz zbędne efekty wizualne.',
            'drivers': 'Sterowniki',
            'driversRecommendation': 'Upewnij się, że wszystkie sterowniki, szczególnie GPU, są aktualne dla optymalnej wydajności w grach.',
            'gameSettings': 'Ustawienia gier',
            'gameSettingsRecommendation': 'W ustawieniach gier priorytetyzuj wysoką liczbę klatek na sekundę zamiast jakości wizualnej dla gier rywalizacyjnych.',
            
            // Mouse test specific
            'mouseTestInstructions': 'Poruszaj myszą w tym obszarze. Test będzie śledzić wzorce ruchu i czas reakcji.',
            'moveMouseInstructions': 'Kontynuuj poruszanie myszą w różnych wzorcach, aby zebrać dane.',
            'mouseTip': 'Dla najlepszej wydajności w grach używaj myszy z częstotliwością próbkowania co najmniej 1000Hz na wysokiej jakości podkładce.',
            'mouseInterpretation': 'Niższe opóźnienie i wyższa częstotliwość próbkowania wskazują na lepszą wydajność myszy w grach.',
            
            // Click test specific
            'clickTestInstructions': 'Klikaj w cele tak szybko, jak to możliwe, gdy się pojawią.',
            'pressKeysInstructions': 'Naciskaj różne klawisze na klawiaturze, aby przetestować czas reakcji.',
            'click': 'Kliknij',
            'tooSlow': 'Za wolno!',
            'missed': 'Pudło!',
            'pressed': 'Naciśnięto',
            'hits': 'Trafienia',
            'misses': 'Pudła',
            'clickTip': 'Profesjonalni gracze zazwyczaj mają czas reakcji poniżej 250ms. Regularne treningi mogą poprawić twój czas reakcji.',
            'clickInterpretation': 'Niższe czasy reakcji wskazują na lepsze odruchy w grach konkurencyjnych. Staraj się o spójność w swoich reakcjach.',
            
            // Keyboard test specific
            'keyboardTestInstructions': 'Naciśnij różne klawisze na klawiaturze. Test zmierzy czasy reakcji i spójność.',
            'pressAnyKey': 'Naciśnij dowolny klawisz',
            'keyPressTime': 'Czas naciśnięcia klawisza',
            'keyboardConsistency': 'Spójność klawiatury',
            'movementConsistency': 'Spójność ruchu',
            'keyStability': 'Stabilność klawiszy',
            'mostUsedKey': 'Najczęściej używany klawisz',
            'times': 'razy',
            'keyboardTip': 'Klawiatury mechaniczne zazwyczaj oferują lepsze czasy reakcji niż klawiatury membranowe.',
            'keyboardInterpretation': 'Niższe czasy naciśnięcia klawiszy wskazują na bardziej responsywną klawiaturę, co jest korzystne dla gier.',
            'keyPressTimeRange': 'Zakres czasu naciśnięcia klawisza',
            
            // Keyboard types
            'premiumMechanical': 'Wysokiej klasy klawiatura mechaniczna do gier',
            'gamingMechanical': 'Klawiatura mechaniczna do gier',
            'hybridOfficeMechanical': 'Hybrydowa/biurowa klawiatura mechaniczna',
            'gamingMembrane': 'Membranowa klawiatura do gier',
            'standardMembrane': 'Standardowa klawiatura membranowa',
            
            // Display test specific
            'refreshTestInstructions': 'Ten test zmierzy częstotliwość odświeżania monitora i spójność klatek.',
            'motionTestInstructions': 'Ten test ocenia jak wyraźnie twój monitor wyświetla poruszające się obiekty.',
            'syncTestInstructions': 'Ten test wykrywa czy VSync lub technologie adaptacyjnej synchronizacji są aktywne w twoim systemie.',
            'refreshInterpretation': 'Wyższe częstotliwości odświeżania i niższy jitter zapewniają płynniejszą rozgrywkę i potencjalnie niższe opóźnienie wejścia.',
            'motionInterpretation': 'Lepsza czytelność ruchu pozwala wyraźniej widzieć poruszające się obiekty, co jest kluczowe w szybkich grach.',
            'syncInterpretation': 'Odpowiednie technologie synchronizacji pomagają wyeliminować rozrywanie obrazu i zapewniają płynniejszą rozgrywkę.',
            'frameTime': 'Czas klatki',
            'jitter': 'Jitter',
            'refreshTip': 'Dla gier konkurencyjnych szukaj monitorów z częstotliwością odświeżania co najmniej 144Hz i technologią adaptacyjnej synchronizacji.',
            'motionTestLoading': 'Ładowanie testu ruchu...',
            'speed': 'Prędkość',
            'rateClarity': 'Oceń czytelność poruszającego się obiektu',
            'refreshRateTest': 'Test częstotliwości odświeżania',
            
            // System test specific
            'systemTestInstructions': 'Ten test zmierzy responsywność i opóźnienie twojego systemu.',
            'cpuTestInstructions': 'Ten test oceni wydajność twojego procesora zarówno w scenariuszach jednowątkowych, jak i wielowątkowych.',
            'memoryTestInstructions': 'Ten test oceni wydajność twojej pamięci w scenariuszach istotnych dla gier.',
            'systemTestStarted': 'Test opóźnienia systemowego rozpoczęty...',
            'measuringTimingPrecision': 'Pomiar precyzji czasu...',
            'measuringRafLatency': 'Pomiar opóźnienia odświeżania wyświetlacza...',
            'measuringEventLoopLatency': 'Pomiar opóźnienia pętli zdarzeń systemu...',
            'calculatingResults': 'Obliczanie końcowych wyników...',
            'systemInterpretation': 'Niższe opóźnienie systemowe zapewnia bardziej responsywną rozgrywkę i potencjalnie lepszą wydajność w grach.',
            'systemTip': 'Zamknij aplikacje działające w tle i wyłącz zbędne efekty wizualne, aby zminimalizować opóźnienie systemowe.',
            
            // CPU specific
            'testingSingleThreadPerformance': 'Testowanie wydajności jednowątkowej...',
            'testingSortingPerformance': 'Testowanie wydajności sortowania...',
            'testingPrimeCalculation': 'Testowanie obliczania liczb pierwszych...',
            'testingMultithreading': 'Testowanie możliwości wielowątkowych...',
            'simulatedCpuUsage': 'Symulowane wykorzystanie CPU',
            'cpuInterpretation': 'Wyższa wydajność CPU, zwłaszcza jednowątkowa, jest kluczowa dla gier, ponieważ większość gier nie wykorzystuje w pełni wszystkich rdzeni.',
            'singleThreadPerformance': 'Wydajność jednowątkowa',
            'multiThreadPerformance': 'Wydajność wielowątkowa',
            'detectedCoresThreads': 'Wykryte rdzenie/wątki',
            'points': 'punkty',
            
            // CPU categories
            'premiumGamingCpu': 'Procesor klasy premium do gier',
            'highEndGamingCpu': 'Procesor wysokiej klasy do gier',
            'midRangeGamingCpu': 'Procesor średniej klasy do gier',
            'entryLevelGamingCpu': 'Procesor podstawowy do gier',
            'generalPurposeCpu': 'Procesor ogólnego przeznaczenia',
            
            // Gaming capability
            'excellentForAllGames': 'Doskonały do wszystkich gier',
            'veryGood': 'Bardzo dobry',
            'good': 'Dobry',
            'basic': 'Podstawowy',
            'limited': 'Ograniczony',
            
            // CPU recommendations
            'cpuExcellentRecommendation': 'Twój procesor jest doskonały do gier. Nie są potrzebne aktualizacje w tym momencie.',
            'cpuVeryGoodRecommendation': 'Twój procesor działa bardzo dobrze w większości gier. Rozważ aktualizacje tylko dla najbardziej wymagających tytułów.',
            'cpuGoodRecommendation': 'Twój procesor działa dobrze w większości gier. Rozważ aktualizacje dla lepszej wydajności w tytułach wymagających dużej mocy obliczeniowej.',
            'cpuBasicRecommendation': 'Twój procesor zapewnia podstawową wydajność w grach. Rozważ aktualizację dla lepszych doświadczeń z grami.',
            'cpuLimitedRecommendation': 'Twój procesor ma ograniczone możliwości gamingowe. Rozważ aktualizację dla nowoczesnych gier.',
            
            // Memory test specific
            'testingMemoryAllocation': 'Testowanie szybkości alokacji pamięci...',
            'testingMemoryAccess': 'Testowanie szybkości dostępu do pamięci...',
            'testingLargeObjects': 'Testowanie obsługi dużych obiektów...',
            'testingGarbageCollection': 'Testowanie wydajności zarządzania pamięcią...',
            'memoryInterpretation': 'Szybsze operacje na pamięci zmniejszają czasy ładowania i poprawiają wydajność w grach wymagających dużo pamięci.',
            'memoryLowPerformanceRecommendation': 'Wydajność pamięci jest poniżej średniej. Rozważ aktualizację do szybszej pamięci RAM lub dodanie większej pojemności.',
            'memoryAveragePerformanceRecommendation': 'Wydajność pamięci jest odpowiednia. Dla lepszej wydajności w grach rozważ szybszą pamięć RAM z lepszymi opóźnieniami.',
            'memoryHighPerformanceRecommendation': 'Wydajność pamięci jest dobra. Nie są potrzebne natychmiastowe aktualizacje dla gier.',
            'memoryLowGcRecommendation': 'Wykryto słabe zarządzanie pamięcią. Zamknij aplikacje działające w tle przed sesjami gier.',
            
            // GPU test specific
            'renderingTestInstructions': 'Ten test oceni możliwości renderowania 3D twojej karty graficznej.',
            'shaderTestInstructions': 'Ten test oceni jak twoja karta graficzna radzi sobie z różnymi złożonościami shaderów.',
            'textureTestInstructions': 'Ten test oceni możliwości obsługi tekstur twojej karty graficznej.',
            'renderingInterpretation': 'Wyższe FPS i stabilność wskazują na lepszą wydajność GPU w grach.',
            'shaderInterpretation': 'Lepsza obsługa złożonych shaderów wskazuje na bardziej wydajną kartę graficzną dla nowoczesnych gier z zaawansowanymi efektami wizualnymi.',
            'textureInterpretation': 'Szybsza obsługa tekstur wskazuje na lepszą wydajność w grach z teksturami wysokiej rozdzielczości.',
            'renderingTestRunning': 'Test renderowania w toku... Proszę czekać.',
            'shaderTestRunning': 'Test złożoności shaderów w toku... Proszę czekać.',
            'textureTestRunning': 'Test streamingu tekstur w toku... Proszę czekać.',
            'webglNotSupported': 'WebGL nie jest obsługiwany',
            'webglRequiredForTest': 'Twoja przeglądarka lub sprzęt graficzny nie obsługuje WebGL, który jest wymagany do tego testu.',
            'loadingTextures': 'Ładowanie tekstur...',
            'testingTextureSize': 'Testowanie rozmiaru tekstury',
            
            // GPU recommendations
            'shaderLowPerformanceRecommendation': 'Twoja karta graficzna ma problemy ze złożonymi shaderami. Rozważ aktualizację karty graficznej dla nowoczesnych gier.',
            'shaderAveragePerformanceRecommendation': 'Twoja karta graficzna radzi sobie odpowiednio z shaderami. Dla lepszych efektów wizualnych rozważ mocniejszą kartę graficzną.',
            'shaderHighPerformanceRecommendation': 'Twoja karta graficzna dobrze radzi sobie ze złożonymi shaderami. Nie są potrzebne natychmiastowe aktualizacje dla wydajności shaderów.',
            'shaderHighDropRecommendation': 'Wykryto duży spadek wydajności przy złożonych shaderach. Obniż jakość shaderów w ustawieniach gier.',
            'shaderModerateDropRecommendation': 'Umiarkowany spadek wydajności ze złożonymi shaderami. Rozważ optymalizację ustawień shaderów w wymagających grach.',
            'textureLowPerformanceRecommendation': 'Twoja karta graficzna ma poniżej średniej obsługę tekstur. Rozważ aktualizację dla gier z teksturami w wysokiej rozdzielczości.',
            'textureAveragePerformanceRecommendation': 'Twoja karta graficzna ma odpowiednią obsługę tekstur. Dla lepszej wydajności z teksturami wysokiej rozdzielczości rozważ kartę graficzną z większą ilością pamięci VRAM.',
            'textureHighPerformanceRecommendation': 'Twoja karta graficzna dobrze radzi sobie z teksturami. Nie są potrzebne natychmiastowe aktualizacje dla wydajności tekstur.',
            'textureSizeLimitationRecommendation': 'Twoja karta graficzna ma ograniczony maksymalny rozmiar tekstur. Możesz napotkać problemy z teksturami wysokiej rozdzielczości w grach.',
            
            // Audio test specific
            'audioLatencyTestInstructions': 'Ten test zmierzy opóźnienie między wyzwoleniem dźwięku a jego odtworzeniem.',
            'audioQualityTestInstructions': 'Ten test oceni jakość i możliwości twojego systemu audio.',
            'audioLatencyTestRunning': 'Test opóźnienia audio w toku... Proszę czekać.',
            'audioQualityTestRunning': 'Test jakości audio w toku... Proszę czekać.',
            'audioContextError': 'Błąd inicjalizacji kontekstu audio. Upewnij się, że dźwięk jest włączony w przeglądarce.',
            'measuringLatency': 'Pomiar opóźnienia audio...',
            'measuredLatency': 'Zmierzone opóźnienie',
            'readyToStart': 'Gotowy do rozpoczęcia testu',
            'playTestTone': 'Odtwórz ton testowy',
            'stopTestTone': 'Zatrzymaj ton testowy',
            'testCompleted': 'Test zakończony',
            'testStopped': 'Test zatrzymany',
            'playFrequencySweep': 'Odtwórz przemiatanie częstotliwości',
            'testDynamicRange': 'Testuj zakres dynamiki',
            'selectQualityTest': 'Wybierz test jakości do uruchomienia',
            'frequencySweepComplete': 'Przemiatanie częstotliwości zakończone',
            'dynamicRangeTestComplete': 'Test zakresu dynamiki zakończony',
            'dynamicRange': 'Zakres dynamiki',
            
            // Audio test results
            'audioLatencyResults': 'Wyniki opóźnienia audio',
            'audioQualityResults': 'Wyniki jakości audio',
            'averageLatency': 'Średnie opóźnienie',
            'minimumLatency': 'Minimalne opóźnienie',
            'maximumLatency': 'Maksymalne opóźnienie',
            'latencyJitter': 'Jitter opóźnienia',
            'sampleCount': 'Liczba próbek',
            'audioLatencyInterpretation': 'Niższe opóźnienie audio zapewnia lepszą synchronizację między obrazem a dźwiękiem w grach.',
            'audioHighLatencyRecommendation': 'Twoje opóźnienie audio jest wysokie. Sprawdź sterowniki audio i ustawienia lub rozważ dedykowany zestaw słuchawkowy/kartę dźwiękową do gier.',
            'audioMediumLatencyRecommendation': 'Twoje opóźnienie audio jest umiarkowane. Dla gier konkurencyjnych rozważ optymalizację ustawień audio.',
            'audioLowLatencyRecommendation': 'Twoje opóźnienie audio jest dobre. Nie są potrzebne natychmiastowe ulepszenia dla gier.',
            'audioHighJitterRecommendation': 'Wykryto wysoki jitter audio. Może to powodować niespójny dźwięk. Rozważ aktualizację sterowników audio.',
            
            // General and cross-test items
            'parameter': 'Parametr',
            'value': 'Wartość',
            'rating': 'Ocena',
            'interpretation': 'Interpretacja',
            'tip': 'Wskazówka',
            'latencyMs': 'Opóźnienie (ms)',
            'timeMs': 'Czas (ms)',
            'frequency': 'Częstotliwość',
            'performancePoints': 'Punkty wydajności',
            'frame': 'Klatka',
            'sampleNumber': 'Numer próbki',
            'insufficientData': 'Niewystarczające dane',
            'needMoreMouseData': 'Zebrano za mało danych o ruchach myszy. Spróbuj ponownie i poruszaj myszą więcej.',
            'needMoreClickData': 'Zebrano za mało danych o kliknięciach. Spróbuj ponownie i kliknij więcej celów.',
            'needMoreKeyboardData': 'Zebrano za mało danych z klawiatury. Spróbuj ponownie i naciśnij więcej klawiszy.',
            'needMoreRefreshData': 'Zebrano za mało danych wyświetlacza. Spróbuj ponownie dla dokładniejszych wyników.',
            'needMoreMotionData': 'Zebrano za mało danych o czytelności ruchu. Oceń wszystkie testy ruchu.',
            'needMoreRenderingData': 'Zebrano za mało danych renderowania. Pozwól testowi działać dłużej.',
            'needMoreShaderData': 'Zebrano za mało danych o wydajności shaderów. Pozwól testowi działać dłużej.',
            'notEnoughData': 'Nie zebrano wystarczającej ilości danych, aby zapewnić dokładne wyniki.',
            'noResultsAvailable': 'Brak dostępnych wyników testów. Uruchom test ponownie.',
            'frameTimeMs': 'Czas klatki (ms)',
            'jitterMs': 'Jitter (ms)',
            'reactionTimeMs': 'Czas reakcji (ms)',
            'loadTimeMs': 'Czas ładowania (ms)',
            'attemptNumber': 'Numer próby',
            
            // Rating levels
            'excellent': 'Doskonały',
            'good': 'Dobry',
            'average': 'Przeciętny',
            'poor': 'Słaby',
            'bad': 'Zły',
            
            // Yes/No
            'yes': 'Tak',
            'no': 'Nie',
            
            // Additional keys from display.js
            'framesToRender': 'Klatki do renderowania',
            'apiPrecision': 'Precyzja API',
            'rafLatency': 'Opóźnienie RAF',
            'eventLoopLatency': 'Opóźnienie pętli zdarzeń',
            'totalLatency': 'Całkowite opóźnienie',
            'timingApiPrecision': 'Precyzja API pomiaru czasu',
            'rafVariability': 'Zmienność RAF',
            'eventLoopVariability': 'Zmienność pętli zdarzeń',
            'systemPerformanceIndex': 'Indeks wydajności systemu',
            'systemBottleneck': 'Wąskie gardło systemu',
            'timingPrecision': 'Precyzja pomiaru czasu',
            'totalSystemLatency': 'Całkowite opóźnienie systemowe',
            'textClarity': 'Czytelność tekstu',
            'objectSharpness': 'Ostrość obiektów',
            'motionBlur': 'Rozmycie ruchu',
            'ghosting': 'Powidoki',
            'overall': 'Ogólnie',
            'textClarityTest': 'Test czytelności tekstu',
            'objectSharpnessTest': 'Test ostrości obiektów',
            'motionBlurTest': 'Test rozmycia ruchu',
            'motionGhostingTest': 'Test powidoków',
            'motionOverallTest': 'Ogólny test ruchu',
            'motionClarityScore': 'Wynik czytelności ruchu',
            'ghostingRating': 'Ocena powidoków',
            'overallRating': 'Ocena ogólna',
            'motionBadRecommendation': 'Twój wyświetlacz ma słabą czytelność ruchu. Rozważ monitor z szybszym czasem reakcji i wyższą częstotliwością odświeżania.',
            'motionAverageRecommendation': 'Twój wyświetlacz ma przeciętną czytelność ruchu. Włączenie trybu gry lub ustawień overdrive może pomóc.',
            'motionGoodRecommendation': 'Twój wyświetlacz ma dobrą czytelność ruchu. Odpowiedni dla większości scenariuszy gamingowych.',
            'motionBlurRecommendation': 'Wykryto znaczące rozmycie ruchu. Szukaj monitorów z lepszym czasem reakcji lub technologią redukcji rozmycia.',
            'ghostingRecommendation': 'Wykryto artefakty powidoków. Spróbuj dostosować ustawienia overdrive w monitorze dla lepszej czytelności.',
            'vSync': 'VSync',
            'adaptiveSync': 'Adaptive Sync',
            'tearingLevel': 'Poziom rozrywania',
            'frameTimeConsistency': 'Spójność czasu klatki',
            'displaySyncQuality': 'Jakość synchronizacji wyświetlacza',
            'recommendedSyncMode': 'Zalecany tryb synchronizacji',
            'testingVSync': 'Testowanie VSync...',
            'testingAdaptiveSync': 'Testowanie Adaptive Sync...',
            'testingTearing': 'Testowanie rozrywania ekranu...',
            'testVSync': 'Testuj VSync',
            'testAdaptiveSync': 'Testuj Adaptive Sync',
            'testScreenTearing': 'Testuj rozrywanie ekranu',
            'analyzing': 'Analizowanie',
            'syncTestRunning': 'Test synchronizacji w toku...',
            'vSyncDetected': 'Wykryto VSync',
            'vSyncNotDetected': 'Nie wykryto VSync',
            'adaptiveSyncDetected': 'Wykryto Adaptive Sync',
            'adaptiveSyncNotDetected': 'Nie wykryto Adaptive Sync',
            'tearingDetected': 'Wykryto rozrywanie ekranu',
            'tearingNotDetected': 'Nie wykryto rozrywania ekranu',
            'adaptiveSyncRecommendation': 'Adaptive Sync (G-Sync/FreeSync) działa poprawnie. To jest optymalne dla gier.',
            'vSyncRecommendation': 'VSync jest włączony, ale nie wykryto Adaptive Sync. Rozważ włączenie G-Sync/FreeSync, jeśli jest obsługiwany.',
            'tearingRecommendation': 'Wykryto rozrywanie ekranu. Włącz VSync lub najlepiej G-Sync/FreeSync, jeśli jest obsługiwany.',
            'frameTimeVariabilityRecommendation': 'Wykryto wysoką zmienność czasu klatki. Może to powodować zacinanie. Spróbuj ograniczyć FPS lub włączyć technologie synchronizacji.',
            'keepAdaptiveSyncRecommendation': 'Kontynuuj używanie Adaptive Sync (G-Sync/FreeSync) dla optymalnych doświadczeń w grach.',
            'highRefreshNoVSyncRecommendation': 'Przy twojej wysokiej częstotliwości odświeżania, wyłączenie VSync może zmniejszyć opóźnienie wejścia dla gier konkurencyjnych.',
            'enableAdaptiveSyncRecommendation': 'Twój monitor o wysokiej częstotliwości odświeżania skorzystałby z włączenia G-Sync/FreeSync, jeśli jest obsługiwany.',
            'highRefreshCurrentSettingRecommendation': 'Twoja obecna konfiguracja monitora o wysokiej częstotliwości odświeżania jest dobrze skonfigurowana do gier.',
            'lowRefreshVSyncRecommendation': 'Przy 60Hz włączenie VSync może zredukować rozrywanie, ale zwiększy opóźnienie wejścia.',
            'lowRefreshAdaptiveSyncRecommendation': 'Dla twojego wyświetlacza 60Hz rozważ włączenie G-Sync/FreeSync, jeśli jest obsługiwany, aby zmniejszyć opóźnienie wejścia przy jednoczesnym zapobieganiu rozrywaniu.',
            'midRefreshUpgradeRecommendation': 'Rozważ aktualizację do monitora 144Hz+ z Adaptive Sync dla lepszych doświadczeń w grach.',

            // Additional keys from other modules
            'latencyDistribution': 'Rozkład opóźnienia',
            'latencyRange': 'Zakres opóźnienia',
            'reactionTimeDistribution': 'Rozkład czasu reakcji',
            'fpsDistribution': 'Rozkład FPS',
            'fpsRange': 'Zakres FPS',
            'fibonacciTest': 'Test Fibonacciego',
            'sortingTest': 'Test sortowania',
            'primeNumbersTest': 'Test liczb pierwszych',
            'cpuCategory': 'Kategoria CPU',
            'gamingCapability': 'Możliwości gamingowe',
            'overallMemoryPerformance': 'Ogólna wydajność pamięci',
            'memoryAllocationSpeed': 'Szybkość alokacji pamięci',
            'memoryAccessSpeed': 'Szybkość dostępu do pamięci',
            'largeObjectHandling': 'Obsługa dużych obiektów',
            'garbageCollectionPerformance': 'Wydajność odzyskiwania pamięci',
            'averageFrameTime': 'Średni czas klatki',
            'measuredFPS': 'Zmierzone FPS',
            'frameTimeJitter': 'Jitter czasu klatki',
            'minimumFrameTime': 'Minimalny czas klatki',
            'maximumFrameTime': 'Maksymalny czas klatki',
            'detectedRefreshRate': 'Wykryta częstotliwość odświeżania',
            'refreshTestResults': 'Wyniki testu częstotliwości odświeżania',
            'motionTestResults': 'Wyniki testu czytelności ruchu',
            'syncTestResults': 'Wyniki testu synchronizacji',
            'syncQualityScore': 'Wynik jakości synchronizacji',
            'overallQualityScore': 'Ogólny wynik jakości',
            'frequencyResponse': 'Odpowiedź częstotliwościowa',
            'distortion': 'Zniekształcenia',
            'overallQuality': 'Ogólna jakość',
            'audioQuality': 'Jakość audio',
            'audioLowQualityRecommendation': 'Jakość twojego audio jest poniżej średniej. Rozważ aktualizację sprzętu audio dla lepszych doświadczeń w grach.',
            'audioMediumQualityRecommendation': 'Jakość twojego audio jest odpowiednia. Dla lepszego dźwięku w grach rozważ zestaw słuchawkowy do gier lub zewnętrzną kartę dźwiękową.',
            'audioHighQualityRecommendation': 'Jakość twojego audio jest dobra. Nie są potrzebne natychmiastowe aktualizacje dla dźwięku w grach.',
            'audioPoorFrequencyRecommendation': 'Wykryto słabą odpowiedź częstotliwościową. Użycie korektora może pomóc zrównoważyć wyjście audio.',
            'audioPoorDynamicRangeRecommendation': 'Wykryto ograniczony zakres dynamiki. Może to wpływać na twoją zdolność słyszenia subtelnych wskazówek dźwiękowych w grach.',
            'audioQualityInterpretation': 'Lepsza jakość audio pozwala słyszeć subtelne wskazówki dźwiękowe w grach i poprawia ogólne wrażenia z gry.'
        }
    };

    /**
     * Initialize the translator
     */
    function init() {
        try {
            if (!document.body) {
                console.warn('Translator init: document.body not available yet');
                return false;
            }
    
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            
            // Set current language based on browser language, fallback to English if not supported
            if (languages[browserLang]) {
                currentLanguage = languages[browserLang];
            }
            
            // Apply translations to all elements with data-i18n attribute
            translatePage();
            
            // Add event listener for dynamic content
            let mutationTimeout;
            const observer = new MutationObserver(function(mutations) {
                clearTimeout(mutationTimeout);
                mutationTimeout = setTimeout(() => {
                    let shouldTranslate = false;
                    
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length) {
                            for (let i = 0; i < mutation.addedNodes.length; i++) {
                                const node = mutation.addedNodes[i];
                                if (node.nodeType === 1) { // Element node
                                    if (node.getAttribute && node.getAttribute('data-i18n')) {
                                        shouldTranslate = true;
                                    } else if (node.querySelectorAll) {
                                        const transNodes = node.querySelectorAll('[data-i18n]');
                                        if (transNodes.length > 0) {
                                            shouldTranslate = true;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    
                    if (shouldTranslate) {
                        translatePage();
                    }
                }, 100);
            });
            
            observer.observe(document.body, { 
                childList: true,
                subtree: true
            });
            
            // Log initialization
            console.log(`Translator initialized. Language: ${currentLanguage.name}`);
            return true;
        } catch (err) {
            console.error('Translator initialization failed:', err);
            return false;
        }
    }

    /**
     * Translate the page
     */
    function translatePage() {
        try {
            const elements = document.querySelectorAll('[data-i18n]');
            
            elements.forEach(element => {
                try {
                    const key = element.getAttribute('data-i18n');
                    const translation = translate(key);
                    
                    if (translation) {
                        // If it's an input placeholder, set the placeholder attribute
                        if (element.placeholder !== undefined) {
                            element.placeholder = translation;
                        } else {
                            element.textContent = translation;
                        }
                    }
                } catch (err) {
                    console.warn('Error translating element:', element, err);
                }
            });
        } catch (err) {
            console.error('Translation error:', err);
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @returns {string} Translated text or the key itself if translation not found
     */
    function translate(key) {
        // Get current language code
        const langCode = currentLanguage.code;
        
        // Try to get translation for the key in current language
        if (translations[langCode] && translations[langCode][key]) {
            return translations[langCode][key];
        }
        
        // Fallback to English if translation not found in current language
        if (translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }
        
        // Return the key itself if no translation found
        return key;
    }

    /**
     * Get the current language
     * @returns {Object} Current language object
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Set language manually
     * @param {string} langCode - Language code
     * @returns {boolean} Success status
     */
    function setLanguage(langCode) {
        if (languages[langCode]) {
            currentLanguage = languages[langCode];
            translatePage();
            return true;
        }
        return false;
    }

    /**
     * Get all available languages
     * @returns {Object} Available languages
     */
    function getAvailableLanguages() {
        return languages;
    }

    /**
     * Add translations for a new language or update existing ones
     * @param {string} langCode - Language code
     * @param {string} langName - Language name
     * @param {string} nativeName - Native language name
     * @param {Object} translationDict - Dictionary of translations
     * @returns {boolean} Success status
     */
    function addLanguage(langCode, langName, nativeName, translationDict) {
        if (langCode && langName && nativeName && translationDict) {
            languages[langCode] = { code: langCode, name: langName, nativeName: nativeName };
            translations[langCode] = translationDict;
            return true;
        }
        return false;
    }

    // Public API
    const api = {
        init,
        translate,
        getCurrentLanguage,
        setLanguage,
        getAvailableLanguages,
        addLanguage
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            try {
                init();
            } catch (err) {
                console.error('Translator initialization error:', err);
            }
        }, 100);
    });
    
    return api;
})();