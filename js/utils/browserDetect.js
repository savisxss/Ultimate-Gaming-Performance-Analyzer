/**
 * Ultimate Gaming Performance Analyzer
 * Browser Detection Module
 * 
 * This module handles browser detection and environment checks
 * for optimal testing conditions.
 */

const BrowserDetect = (function() {
    /**
     * Detect the user's browser
     * @returns {Object} Browser information
     */
    function detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "";
        let browserIcon = "fa-globe"; // Default icon
        
        // Check for Edge first (as Edge also includes Chrome in user agent)
        if (userAgent.indexOf("Edg") !== -1) {
            browserName = "Edge";
            browserIcon = "fa-edge";
            browserVersion = userAgent.match(/Edg\/([0-9.]+)/)[1];
        }
        // Check for Chrome
        else if (userAgent.indexOf("Chrome") !== -1) {
            browserName = "Chrome";
            browserIcon = "fa-chrome";
            browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
        }
        // Check for Firefox
        else if (userAgent.indexOf("Firefox") !== -1) {
            browserName = "Firefox";
            browserIcon = "fa-firefox";
            browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
        }
        // Check for Safari
        else if (userAgent.indexOf("Safari") !== -1) {
            browserName = "Safari";
            browserIcon = "fa-safari";
            browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
        }
        // Check for Opera
        else if (userAgent.indexOf("OPR") !== -1 || userAgent.indexOf("Opera") !== -1) {
            browserName = "Opera";
            browserIcon = "fa-opera";
            browserVersion = userAgent.indexOf("OPR") !== -1 
                ? userAgent.match(/OPR\/([0-9.]+)/)[1]
                : userAgent.match(/Opera\/([0-9.]+)/)[1];
        }
        // Check for Internet Explorer
        else if (userAgent.indexOf("Trident") !== -1) {
            browserName = "Internet Explorer";
            browserIcon = "fa-internet-explorer";
            browserVersion = userAgent.match(/rv:([0-9.]+)/)[1];
        }
        
        return {
            name: browserName,
            version: browserVersion,
            icon: browserIcon,
            isRecommended: (browserName === "Chrome" || browserName === "Edge")
        };
    }
    
    /**
     * Check if the browser is in fullscreen mode
     * @returns {boolean} True if in fullscreen mode
     */
    function isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }
    
    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        if (!isFullscreen()) {
            // Request fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    
    /**
     * Check if hardware acceleration is enabled
     * @returns {boolean} True if hardware acceleration is likely enabled
     */
    function isHardwareAccelerationEnabled() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || 
                  canvas.getContext('experimental-webgl');
                  
        if (!gl) {
            return false; // WebGL not available
        }
        
        // Check for specific extensions or capabilities that indicate acceleration
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) {
            // Debug info not available, but WebGL is supported
            // so hardware acceleration is probably enabled
            return true;
        }
        
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        // If renderer contains software names, hardware acceleration might be disabled
        const softwareRenderers = [
            'swiftshader', 'llvmpipe', 'software', 'mesa', 'microsoft basic render'
        ];
        
        for (const softwareRenderer of softwareRenderers) {
            if (renderer.toLowerCase().includes(softwareRenderer)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get detailed information about hardware acceleration
     * @returns {Object} Hardware acceleration information
     */
    function getAccelerationInfo() {
        const info = {
            webglSupported: false,
            webgl2Supported: false,
            hardwareAccelerated: false,
            renderer: 'Unknown',
            vendor: 'Unknown',
            maxTextureSize: 0,
            antialiasing: false,
            extensions: []
        };
        
        try {
            // Check WebGL support
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || 
                      canvas.getContext('experimental-webgl');
            
            if (gl) {
                info.webglSupported = true;
                
                // Check for debug info extension
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    info.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    info.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                } else {
                    info.renderer = gl.getParameter(gl.RENDERER);
                    info.vendor = gl.getParameter(gl.VENDOR);
                }
                
                // Get maximum texture size
                info.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                
                // Check for antialiasing
                info.antialiasing = gl.getContextAttributes().antialias;
                
                // Get list of supported extensions
                const extensions = gl.getSupportedExtensions();
                if (extensions) {
                    info.extensions = extensions;
                }
                
                // Determine if hardware acceleration is enabled
                info.hardwareAccelerated = isHardwareAccelerationEnabled();
            }
            
            // Check WebGL2 support
            const gl2 = canvas.getContext('webgl2');
            info.webgl2Supported = !!gl2;
            
        } catch (e) {
            console.error('Error detecting WebGL capabilities:', e);
        }
        
        return info;
    }
    
    /**
     * Check for touch support
     * @returns {boolean} True if touch is supported
     */
    function isTouchSupported() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    /**
     * Get display information
     * @returns {Object} Display information
     */
    function getDisplayInfo() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown'
        };
    }
    
    /**
     * Check if the device is likely a mobile device
     * @returns {boolean} True if device is likely mobile
     */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 800 && window.innerHeight <= 600);
    }
    
    /**
     * Check if connection is likely to be slow
     * @returns {boolean} True if connection is likely slow
     */
    function isSlowConnection() {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
                          
        if (!connection) {
            return false; // Cannot determine
        }
        
        if (connection.saveData) {
            return true; // Data saving mode is enabled
        }
        
        if (connection.effectiveType) {
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' || 
                   connection.effectiveType === '3g';
        }
        
        return connection.type === 'cellular' && connection.downlink < 1;
    }
    
    /**
     * Get system information
     * @returns {Object} System information
     */
    function getSystemInfo() {
        return {
            browser: detectBrowser(),
            display: getDisplayInfo(),
            acceleration: getAccelerationInfo(),
            isMobile: isMobileDevice(),
            isTouch: isTouchSupported(),
            isSlowConnection: isSlowConnection(),
            isFullscreen: isFullscreen(),
            cpuCores: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'unknown',
            platform: navigator.platform,
            languages: navigator.languages || [navigator.language],
            doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
            cookiesEnabled: navigator.cookieEnabled,
            online: navigator.onLine
        };
    }
    
    /**
     * Get a list of environment issues that might affect test accuracy
     * @returns {Array} List of issues detected
     */
    function detectEnvironmentIssues() {
        const issues = [];
        const browser = detectBrowser();
        
        // Check browser
        if (!browser.isRecommended) {
            issues.push({
                severity: 'warning',
                message: `Using ${browser.name} may result in less accurate measurements. Chrome or Edge is recommended.`,
                code: 'non-recommended-browser'
            });
        }
        
        // Check fullscreen
        if (!isFullscreen()) {
            issues.push({
                severity: 'warning',
                message: 'Fullscreen mode is recommended for most accurate results.',
                code: 'not-fullscreen'
            });
        }
        
        // Check hardware acceleration
        if (!isHardwareAccelerationEnabled()) {
            issues.push({
                severity: 'error',
                message: 'Hardware acceleration appears to be disabled. This will significantly affect performance tests.',
                code: 'no-hardware-acceleration'
            });
        }
        
        // Check for mobile device
        if (isMobileDevice()) {
            issues.push({
                severity: 'warning',
                message: 'Mobile devices may not provide accurate gaming performance metrics. Desktop testing is recommended.',
                code: 'mobile-device'
            });
        }
        
        // Check connection
        if (isSlowConnection()) {
            issues.push({
                severity: 'info',
                message: 'Slow network connection detected. This won\'t affect most tests but might impact loading times.',
                code: 'slow-connection'
            });
        }
        
        return issues;
    }
    
    /**
     * Check if device meets minimum requirements for tests
     * @returns {boolean} True if device meets minimum requirements
     */
    function meetsMinimumRequirements() {
        // Basic requirements check
        const hasWebGL = getAccelerationInfo().webglSupported;
        const hasModernBrowser = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera']
            .includes(detectBrowser().name);
        const hasMinimumCores = (navigator.hardwareConcurrency || 0) >= 2;
        
        return hasWebGL && hasModernBrowser && hasMinimumCores;
    }
    
    // Public API
    return {
        detectBrowser,
        isFullscreen,
        toggleFullscreen,
        isHardwareAccelerationEnabled,
        getAccelerationInfo,
        isTouchSupported,
        getDisplayInfo,
        isMobileDevice,
        isSlowConnection,
        getSystemInfo,
        detectEnvironmentIssues,
        meetsMinimumRequirements
    };
})();