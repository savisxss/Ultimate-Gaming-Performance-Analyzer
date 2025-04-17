/**
 * Ultimate Gaming Performance Analyzer
 * GPU Test Module
 * 
 * This module handles 3D rendering, shader complexity, and texture streaming tests.
 */

const GpuTest = (function() {
    // Test state variables
    let renderingTestActive = false;
    let shaderTestActive = false;
    let textureTestActive = false;
    
    // Test data storage
    let renderingResults = {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        stabilityScore: 0,
        performanceScore: 0,
        frameTimeData: []
    };
    
    let shaderResults = {
        averageFPS: 0,
        complexityScore: 0,
        shaderTypes: [],
        performanceByComplexity: {}
    };
    
    let textureResults = {
        loadTimeAvg: 0,
        streamingScore: 0,
        memoryUsage: 0,
        maxTextureSize: 0
    };
    
    // Test UI elements
    let renderingTestArea = null;
    let shaderTestArea = null;
    let textureTestArea = null;
    
    // WebGL contexts
    let renderingGL = null;
    let shaderGL = null;
    let textureGL = null;
    
    // Animation frame IDs
    let renderingAnimationId = null;
    let shaderAnimationId = null;
    let textureAnimationId = null;
    
    // 3D objects and resources
    let cube = null;
    let shaderPrograms = {};
    let textures = {};
    
    /**
     * Initialize WebGL and check if it's supported
     * @param {HTMLCanvasElement} canvas - Canvas to initialize WebGL on
     * @returns {WebGLRenderingContext|null} WebGL context or null if not supported
     */
    function initWebGL(canvas) {
        let gl = null;
        
        try {
            // Try to get WebGL 2 context first
            gl = canvas.getContext('webgl2');
            
            // Fall back to WebGL 1 if WebGL 2 is not available
            if (!gl) {
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            }
            
            // Set viewport to match canvas size
            if (gl) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            }
        } catch (e) {
            console.error('Error initializing WebGL:', e);
            return null;
        }
        
        return gl;
    }
    
    /**
     * Check WebGL capabilities
     * @param {WebGLRenderingContext} gl - WebGL context
     * @returns {Object} WebGL capabilities information
     */
    function checkWebGLCapabilities(gl) {
        if (!gl) return null;
        
        const capabilities = {
            isWebGL2: false,
            maxTextureSize: 0,
            maxCubeMapSize: 0,
            maxRenderbufferSize: 0,
            maxViewportDims: [0, 0],
            maxVertexAttributes: 0,
            maxVertexUniformVectors: 0,
            maxFragmentUniformVectors: 0,
            maxVaryingVectors: 0,
            supportedExtensions: [],
            renderer: 'Unknown',
            vendor: 'Unknown',
            isHardwareAccelerated: false
        };
        
        // Check if WebGL 2
        capabilities.isWebGL2 = gl instanceof WebGL2RenderingContext;
        
        // Get hardware info
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            capabilities.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            capabilities.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            
            // Check if hardware accelerated
            capabilities.isHardwareAccelerated = !capabilities.renderer.toLowerCase().includes('swiftshader') && 
                                               !capabilities.renderer.toLowerCase().includes('llvmpipe') &&
                                               !capabilities.renderer.toLowerCase().includes('software') &&
                                               !capabilities.vendor.toLowerCase().includes('microsoft basic render');
        }
        
        // Get capabilities
        capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        capabilities.maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        capabilities.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        capabilities.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        capabilities.maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        capabilities.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        capabilities.maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        
        if (capabilities.isWebGL2) {
            capabilities.maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
        } else {
            capabilities.maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS || gl.MAX_VARYING_COMPONENTS || 8);
        }
        
        // Get supported extensions
        capabilities.supportedExtensions = gl.getSupportedExtensions();
        
        return capabilities;
    }
    
    /**
     * Create and compile a shader
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {number} type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
     * @param {string} source - GLSL shader source code
     * @returns {WebGLShader|null} Compiled shader or null if compilation failed
     */
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        // Check if shader compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Create and link a shader program
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {WebGLShader} vertexShader - Vertex shader
     * @param {WebGLShader} fragmentShader - Fragment shader
     * @returns {WebGLProgram|null} Linked program or null if linking failed
     */
    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        // Check if program linked successfully
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Error linking program:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    /**
     * Initialize the 3D rendering test
     */
    function initRenderingTest() {
        renderingTestArea = document.getElementById('rendering-test-area');
        
        // Create test area content
        renderingTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('renderingTestInstructions')}</p>
            </div>
            <div class="rendering-container">
                <canvas id="rendering-canvas" width="512" height="384"></canvas>
                <div class="fps-counter" id="rendering-fps">0 FPS</div>
            </div>
            <div class="progress-container" id="rendering-progress">
                <div class="progress-bar" id="rendering-progress-bar"></div>
            </div>
            <div class="test-status" id="rendering-status">${Translator.translate('readyToStart')}</div>
        `;
        
        // Get canvas and initialize WebGL
        const canvas = document.getElementById('rendering-canvas');
        renderingGL = initWebGL(canvas);
        
        // Check if WebGL is supported
        if (!renderingGL) {
            renderingTestArea.innerHTML = `
                <div class="error-message">
                    <h3>${Translator.translate('webglNotSupported')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                </div>
            `;
            return false;
        }
        
        // Check WebGL capabilities
        const capabilities = checkWebGLCapabilities(renderingGL);
        console.log('WebGL Capabilities:', capabilities);
        
        // Initialize 3D cube
        initCube(renderingGL);
        
        // Initialize basic shader program
        const vertexShaderSource = `
            attribute vec3 aVertexPosition;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uNormalMatrix;
            
            varying vec2 vTextureCoord;
            varying vec3 vNormal;
            
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
                vTextureCoord = aTextureCoord;
                vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec2 vTextureCoord;
            varying vec3 vNormal;
            
            uniform sampler2D uSampler;
            uniform vec3 uLightDirection;
            
            void main(void) {
                vec3 normal = normalize(vNormal);
                float light = max(dot(normal, normalize(uLightDirection)), 0.3);
                vec4 texelColor = texture2D(uSampler, vTextureCoord);
                gl_FragColor = vec4(texelColor.rgb * light, texelColor.a);
            }
        `;
        
        const vertexShader = createShader(renderingGL, renderingGL.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(renderingGL, renderingGL.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            renderingTestArea.innerHTML = `
                <div class="error-message">
                    <h3>${Translator.translate('shaderCompilationFailed')}</h3>
                    <p>${Translator.translate('browserMayNotSupportWebGL')}</p>
                </div>
            `;
            return false;
        }
        
        // Create shader program
        const shaderProgram = createProgram(renderingGL, vertexShader, fragmentShader);
        if (!shaderProgram) {
            renderingTestArea.innerHTML = `
                <div class="error-message">
                    <h3>${Translator.translate('shaderProgramCreationFailed')}</h3>
                    <p>${Translator.translate('browserMayNotSupportWebGL')}</p>
                </div>
            `;
            return false;
        }
        
        // Store shader program
        shaderPrograms.basic = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: renderingGL.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexNormal: renderingGL.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: renderingGL.getAttribLocation(shaderProgram, 'aTextureCoord')
            },
            uniformLocations: {
                projectionMatrix: renderingGL.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: renderingGL.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                normalMatrix: renderingGL.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                sampler: renderingGL.getUniformLocation(shaderProgram, 'uSampler'),
                lightDirection: renderingGL.getUniformLocation(shaderProgram, 'uLightDirection')
            }
        };
        
        // Load texture
        loadTexture(renderingGL, 'basic', createCheckerboardTexture(renderingGL, 8, 8));
        
        return true;
    }
    
    /**
     * Initialize the shader test
     */
    function initShaderTest() {
        shaderTestArea = document.getElementById('shader-test-area');
        
        // Create test area content
        shaderTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('shaderTestInstructions')}</p>
            </div>
            <div class="shader-container">
                <canvas id="shader-canvas" width="512" height="384"></canvas>
                <div class="fps-counter" id="shader-fps">0 FPS</div>
                <div class="shader-type" id="shader-type">${Translator.translate('simple')}</div>
            </div>
            <div class="progress-container" id="shader-progress">
                <div class="progress-bar" id="shader-progress-bar"></div>
            </div>
            <div class="test-status" id="shader-status">${Translator.translate('readyToStart')}</div>
        `;
        
        // Get canvas and initialize WebGL
        const canvas = document.getElementById('shader-canvas');
        shaderGL = initWebGL(canvas);
        
        // Check if WebGL is supported
        if (!shaderGL) {
            shaderTestArea.innerHTML = `
                <div class="error-message">
                    <h3>${Translator.translate('webglNotSupported')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                </div>
            `;
            return false;
        }
        
        // Initialize shader test resources
        initShaderTestResources();
        
        return true;
    }
    
    /**
     * Initialize shader test resources
     */
    function initShaderTestResources() {
        // Create a simple quad filling the screen
        const quadPositions = [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0
        ];
        
        const positionBuffer = shaderGL.createBuffer();
        shaderGL.bindBuffer(shaderGL.ARRAY_BUFFER, positionBuffer);
        shaderGL.bufferData(shaderGL.ARRAY_BUFFER, new Float32Array(quadPositions), shaderGL.STATIC_DRAW);
        
        // Store buffer
        shaderPrograms.buffers = {
            position: positionBuffer
        };
        
        // Create shader programs of varying complexity
        
        // 1. Simple shader
        const simpleVS = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = (aPosition + 1.0) / 2.0;
            }
        `;
        
        const simpleFS = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform float uTime;
            
            void main() {
                float r = 0.5 + 0.5 * sin(uTime);
                float g = 0.5 + 0.5 * cos(uTime);
                float b = 0.5 + 0.5 * sin(uTime + 3.14);
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `;
        
        // 2. Medium complexity shader
        const mediumVS = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = (aPosition + 1.0) / 2.0;
            }
        `;
        
        const mediumFS = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform float uTime;
            
            void main() {
                vec2 uv = vTexCoord;
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(uv, center);
                
                float angle = atan(uv.y - center.y, uv.x - center.x);
                float wave = sin(dist * 20.0 + uTime * 2.0) * 0.5 + 0.5;
                float wave2 = cos(angle * 8.0 + uTime * 3.0) * 0.5 + 0.5;
                
                vec3 color = vec3(wave * wave2, wave, wave2);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // 3. Complex shader
        const complexVS = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = (aPosition + 1.0) / 2.0;
            }
        `;
        
        const complexFS = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform float uTime;
            
            // Noise function
            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            // 2D simplex noise
            float noise(vec2 p) {
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                
                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x),
                    u.y);
                return res*res;
            }
            
            void main() {
                vec2 uv = vTexCoord;
                
                // Multiple octaves of noise
                float n = 0.0;
                n += noise(uv * 4.0 + uTime * 0.5) * 0.5;
                n += noise(uv * 8.0 - uTime * 0.3) * 0.25;
                n += noise(uv * 16.0 + uTime * 0.2) * 0.125;
                n += noise(uv * 32.0 - uTime * 0.1) * 0.0625;
                
                // Fractal patterns
                float angle = atan(uv.y - 0.5, uv.x - 0.5);
                float dist = distance(uv, vec2(0.5, 0.5));
                float circle = smoothstep(0.2, 0.21, dist) - smoothstep(0.45, 0.46, dist);
                float rays = 0.5 + 0.5 * sin(angle * 12.0 + uTime * 2.0 + dist * 10.0);
                
                vec3 color = mix(
                    vec3(0.2, 0.5, 0.9),
                    vec3(0.9, 0.4, 0.1),
                    n * rays * circle
                );
                
                // Add some glow effect
                color += pow(1.0 - dist, 3.0) * vec3(0.9, 0.6, 0.3) * (0.5 + 0.5 * sin(uTime));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // 4. Very complex shader
        const veryComplexVS = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            uniform float uTime;
            
            void main() {
                vec2 pos = aPosition;
                float wave = sin(uTime * 0.5) * 0.02;
                pos.x += sin(pos.y * 10.0 + uTime) * wave;
                pos.y += cos(pos.x * 10.0 + uTime) * wave;
                
                gl_Position = vec4(pos, 0.0, 1.0);
                vTexCoord = (aPosition + 1.0) / 2.0;
            }
        `;
        
        const veryComplexFS = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform float uTime;
            
            // Hash function
            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
                p3 += dot(p3, p3.yxz+33.33);
                return fract((p3.xxy + p3.yxx)*p3.zyx);
            }
            
            // 3D Noise
            float noise3D(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f*f*(3.0-2.0*f);
                
                vec2 uv = (i.xy+vec2(37.0,17.0)*i.z) + f.xy;
                vec2 rg = hash33(vec3(uv, i.z)).yz;
                return mix(rg.x, rg.y, f.z);
            }
            
            // Distance field for a sphere
            float sdSphere(vec3 p, float r) {
                return length(p) - r;
            }
            
            // Rotation matrix
            mat3 rotateY(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(
                    c, 0.0, s,
                    0.0, 1.0, 0.0,
                    -s, 0.0, c
                );
            }
            
            mat3 rotateX(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(
                    1.0, 0.0, 0.0,
                    0.0, c, -s,
                    0.0, s, c
                );
            }
            
            // Raymarching
            float scene(vec3 p) {
                // Rotate scene
                p = rotateY(uTime * 0.3) * rotateX(uTime * 0.2) * p;
                
                // Multiple spheres
                float sphere1 = sdSphere(p, 0.5);
                float sphere2 = sdSphere(p + vec3(sin(uTime), cos(uTime), 0.0) * 0.3, 0.25);
                float sphere3 = sdSphere(p + vec3(0.0, sin(uTime), cos(uTime)) * 0.3, 0.2);
                
                // Combine with smooth min
                float k = 0.2;
                float d = sphere1;
                d = min(d, sphere2);
                d = min(d, sphere3);
                
                // Add noise
                d += noise3D(p * 4.0 + vec3(0.0, 0.0, uTime)) * 0.05;
                
                return d;
            }
            
            // Main raymarching function
            vec3 raymarch(vec3 ro, vec3 rd) {
                float t = 0.0;
                float d = 0.0;
                
                for (int i = 0; i < 64; i++) {
                    vec3 p = ro + rd * t;
                    d = scene(p);
                    if (d < 0.001 || t > 5.0) break;
                    t += d * 0.5; // Advance with relaxation factor
                }
                
                if (d < 0.001) {
                    // We hit something
                    vec3 p = ro + rd * t;
                    vec3 normal = normalize(vec3(
                        scene(p + vec3(0.001, 0.0, 0.0)) - scene(p - vec3(0.001, 0.0, 0.0)),
                        scene(p + vec3(0.0, 0.001, 0.0)) - scene(p - vec3(0.0, 0.001, 0.0)),
                        scene(p + vec3(0.0, 0.0, 0.001)) - scene(p - vec3(0.0, 0.0, 0.001))
                    ));
                    
                    // Lighting
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 ambient = vec3(0.1, 0.2, 0.3);
                    vec3 color = vec3(diff) + ambient;
                    
                    // Add material with noise
                    color *= 0.5 + 0.5 * hash33(p * 10.0);
                    
                    return color;
                }
                
                // We didn't hit anything, return sky color
                vec3 col1 = vec3(0.1, 0.15, 0.3);
                vec3 col2 = vec3(0.5, 0.7, 0.9);
                return mix(col1, col2, rd.y * 0.5 + 0.5);
            }
            
            void main() {
                vec2 uv = vTexCoord * 2.0 - 1.0;
                uv.x *= 16.0 / 9.0; // Aspect ratio correction
                
                // Camera setup
                vec3 ro = vec3(0.0, 0.0, -2.0);
                vec3 rd = normalize(vec3(uv, 1.0));
                
                // Raymarching
                vec3 color = raymarch(ro, rd);
                
                // Tone mapping
                color = color / (color + vec3(1.0));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // Create shader programs
        createShaderProgram(shaderGL, 'simple', simpleVS, simpleFS);
        createShaderProgram(shaderGL, 'medium', mediumVS, mediumFS);
        createShaderProgram(shaderGL, 'complex', complexVS, complexFS);
        createShaderProgram(shaderGL, 'veryComplex', veryComplexVS, veryComplexFS);
    }
    
    /**
     * Create shader program and store it
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - Shader program name
     * @param {string} vsSource - Vertex shader source
     * @param {string} fsSource - Fragment shader source
     */
    function createShaderProgram(gl, name, vsSource, fsSource) {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        
        if (!vertexShader || !fragmentShader) {
            console.error(`Failed to create shaders for program '${name}'`);
            return;
        }
        
        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) {
            console.error(`Failed to link shader program '${name}'`);
            return;
        }
        
        // Store program
        shaderPrograms[name] = {
            program: program,
            attribLocations: {
                position: gl.getAttribLocation(program, 'aPosition')
            },
            uniformLocations: {
                time: gl.getUniformLocation(program, 'uTime')
            }
        };
    }
    
    /**
     * Initialize the texture test
     */
    function initTextureTest() {
        textureTestArea = document.getElementById('texture-test-area');
        
        // Create test area content
        textureTestArea.innerHTML = `
            <div class="test-instructions">
                <p>${Translator.translate('textureTestInstructions')}</p>
            </div>
            <div class="texture-container">
                <canvas id="texture-canvas" width="512" height="384"></canvas>
                <div class="texture-info" id="texture-info">${Translator.translate('loadingTextures')}</div>
            </div>
            <div class="progress-container" id="texture-progress">
                <div class="progress-bar" id="texture-progress-bar"></div>
            </div>
            <div class="test-status" id="texture-status">${Translator.translate('readyToStart')}</div>
        `;
        
        // Get canvas and initialize WebGL
        const canvas = document.getElementById('texture-canvas');
        textureGL = initWebGL(canvas);
        
        // Check if WebGL is supported
        if (!textureGL) {
            textureTestArea.innerHTML = `
                <div class="error-message">
                    <h3>${Translator.translate('webglNotSupported')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                </div>
            `;
            return false;
        }
        
        // Initialize texture test resources
        initTextureTestResources();
        
        return true;
    }
    
    /**
     * Initialize texture test resources
     */
    function initTextureTestResources() {
        // Check max texture size
        textureResults.maxTextureSize = textureGL.getParameter(textureGL.MAX_TEXTURE_SIZE);
        
        // Create a simple quad for texture display
        const quadPositions = [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0
        ];
        
        const quadTextureCoords = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];
        
        const positionBuffer = textureGL.createBuffer();
        textureGL.bindBuffer(textureGL.ARRAY_BUFFER, positionBuffer);
        textureGL.bufferData(textureGL.ARRAY_BUFFER, new Float32Array(quadPositions), textureGL.STATIC_DRAW);
        
        const textureCoordBuffer = textureGL.createBuffer();
        textureGL.bindBuffer(textureGL.ARRAY_BUFFER, textureCoordBuffer);
        textureGL.bufferData(textureGL.ARRAY_BUFFER, new Float32Array(quadTextureCoords), textureGL.STATIC_DRAW);
        
        // Store buffers
        shaderPrograms.textureBuffers = {
            position: positionBuffer,
            textureCoord: textureCoordBuffer
        };
        
        // Create a simple texture shader
        const textureVS = `
            attribute vec2 aPosition;
            attribute vec2 aTextureCoord;
            varying vec2 vTextureCoord;
            
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        
        const textureFS = `
            precision mediump float;
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            
            void main() {
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;
        
        // Create shader program
        const vertexShader = createShader(textureGL, textureGL.VERTEX_SHADER, textureVS);
        const fragmentShader = createShader(textureGL, textureGL.FRAGMENT_SHADER, textureFS);
        
        if (!vertexShader || !fragmentShader) {
            console.error('Failed to create texture shaders');
            return;
        }
        
        const program = createProgram(textureGL, vertexShader, fragmentShader);
        if (!program) {
            console.error('Failed to link texture shader program');
            return;
        }
        
        // Store program
        shaderPrograms.texture = {
            program: program,
            attribLocations: {
                position: textureGL.getAttribLocation(program, 'aPosition'),
                textureCoord: textureGL.getAttribLocation(program, 'aTextureCoord')
            },
            uniformLocations: {
                sampler: textureGL.getUniformLocation(program, 'uSampler')
            }
        };
    }
    
    /**
     * Initialize cube geometry
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    function initCube(gl) {
        // Create cube vertices
        const positions = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
            
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
            
            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            
            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];
        
        // Create cube normals
        const normals = [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
            
            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
            
            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
            
            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
            
            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
            
            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];
        
        // Create texture coordinates
        const textureCoordinates = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            
            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            
            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            
            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            
            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            
            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        
        // Create cube indices
        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ];
        
        // Create buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        
        // Store cube data
        cube = {
            positions: positionBuffer,
            normals: normalBuffer,
            textureCoords: textureCoordBuffer,
            indices: indexBuffer,
            count: indices.length
        };
    }
    
    /**
     * Create a checkerboard texture
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @returns {WebGLTexture} The created texture
     */
    function createCheckerboardTexture(gl, width, height) {
        // Create checkerboard pattern
        const data = new Uint8Array(width * height * 4);
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const index = (i * width + j) * 4;
                const isEven = (i + j) % 2 === 0;
                
                if (isEven) {
                    data[index] = 200;   // R
                    data[index + 1] = 200; // G
                    data[index + 2] = 200; // B
                    data[index + 3] = 255; // A
                } else {
                    data[index] = 50;    // R
                    data[index + 1] = 50;  // G
                    data[index + 2] = 50;  // B
                    data[index + 3] = 255; // A
                }
            }
        }
        
        // Create texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        return texture;
    }
    
    /**
     * Load a texture
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - Texture name
     * @param {WebGLTexture} texture - WebGL texture
     */
    function loadTexture(gl, name, texture) {
        textures[name] = texture;
    }
    
    /**
     * Start the 3D rendering test
     */
    function startRenderingTest() {
        // Initialize test if needed
        if (!renderingTestArea) {
            if (!initRenderingTest()) {
                document.getElementById('rendering-results').innerHTML = `
                    <h3>${Translator.translate('testError')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                `;
                return;
            }
        }
        
        // Reset test data
        renderingTestActive = true;
        renderingResults = {
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            stabilityScore: 0,
            performanceScore: 0,
            frameTimeData: []
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('rendering-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('renderingTestRunning')}</p>
            <div class="chart-container">
                <canvas id="rendering-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('rendering-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'FPS',
                    data: [],
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderWidth: 2,
                    tension: 0.2
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
                            text: 'FPS'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('frame')
                        }
                    }
                }
            }
        });
        
        // Start rendering loop
        document.getElementById('rendering-status').textContent = Translator.translate('testRunning');
        document.getElementById('rendering-progress-bar').style.width = '0%';
        
        // Set start time
        const startTime = performance.now();
        let lastFrameTime = startTime;
        let frameCount = 0;
        
        // Run for up to 15 seconds or 600 frames, whichever comes first
        const testDuration = 15000; // 15 seconds
        const maxFrames = 600;
        
        // Start rendering loop
        function render(currentTime) {
            // Calculate frame time and FPS
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            const fps = 1000 / deltaTime;
            
            // Update FPS counter
            document.getElementById('rendering-fps').textContent = `${Math.round(fps)} FPS`;
            
            // Store frame data
            renderingResults.frameTimeData.push({
                time: currentTime - startTime,
                deltaTime: deltaTime,
                fps: fps
            });
            
            // Update min/max FPS
            renderingResults.minFPS = Math.min(renderingResults.minFPS, fps);
            renderingResults.maxFPS = Math.max(renderingResults.maxFPS, fps);
            
            // Update chart every 5 frames to avoid performance impact
            if (frameCount % 5 === 0) {
                updateRenderingChart();
            }
            
            // Render cube
            renderCube(renderingGL, currentTime - startTime);
            
            // Update progress
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(100, (elapsedTime / testDuration) * 100);
            document.getElementById('rendering-progress-bar').style.width = `${progress}%`;
            
            // Check if test should continue
            frameCount++;
            if (renderingTestActive && elapsedTime < testDuration && frameCount < maxFrames) {
                renderingAnimationId = requestAnimationFrame(render);
            } else {
                // Test complete
                stopRenderingTest();
            }
        }
        
        // Start the rendering loop
        renderingAnimationId = requestAnimationFrame(render);
    }
    
    /**
     * Stop the 3D rendering test
     */
    function stopRenderingTest() {
        renderingTestActive = false;
        
        // Stop animation loop
        if (renderingAnimationId) {
            cancelAnimationFrame(renderingAnimationId);
            renderingAnimationId = null;
        }
        
        // Complete progress bar
        document.getElementById('rendering-progress-bar').style.width = '100%';
        document.getElementById('rendering-status').textContent = Translator.translate('testCompleted');
        
        // Analyze and display results
        analyzeRenderingResults();
    }
    
    /**
     * Render a 3D cube
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {number} time - Elapsed time in ms
     */
    function renderCube(gl, time) {
        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Get shader program
        const programInfo = shaderPrograms.basic;
        gl.useProgram(programInfo.program);
        
        // Calculate matrices
        const fieldOfView = 45 * Math.PI / 180;   // 45 degrees in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        
        // Create projection matrix
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        
        // Create model-view matrix
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, time * 0.001, [0, 1, 0]); // Rotate around Y axis
        mat4.rotate(modelViewMatrix, modelViewMatrix, time * 0.0005, [1, 0, 0]); // Rotate around X axis
        
        // Create normal matrix
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, cube.positions);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            3, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        
        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, cube.normals);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            3, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        
        // Bind texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, cube.textureCoords);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        
        // Bind index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indices);
        
        // Set uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform3fv(programInfo.uniformLocations.lightDirection, [0.5, 0.7, 1.0]);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures.basic);
        gl.uniform1i(programInfo.uniformLocations.sampler, 0);
        
        // Draw the cube
        gl.drawElements(gl.TRIANGLES, cube.count, gl.UNSIGNED_SHORT, 0);
    }
    
    /**
     * Update rendering test chart
     */
    function updateRenderingChart() {
        // Get chart
        const chart = Chart.getChart('rendering-chart');
        if (!chart) return;
        
        // Get FPS data
        const fpsData = renderingResults.frameTimeData.map(frame => frame.fps);
        
        // Only show up to the last 100 frames for readability
        const lastFPS = fpsData.slice(-100);
        const labels = Array.from({length: lastFPS.length}, (_, i) => i + 1);
        
        // Update chart
        chart.data.labels = labels;
        chart.data.datasets[0].data = lastFPS;
        chart.update();
    }
    
    /**
     * Start the shader test
     */
    function startShaderTest() {
        // Initialize test if needed
        if (!shaderTestArea) {
            if (!initShaderTest()) {
                document.getElementById('shader-results').innerHTML = `
                    <h3>${Translator.translate('testError')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                `;
                return;
            }
        }
        
        // Reset test data
        shaderTestActive = true;
        shaderResults = {
            averageFPS: 0,
            complexityScore: 0,
            shaderTypes: ['simple', 'medium', 'complex', 'veryComplex'],
            performanceByComplexity: {}
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('shader-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('shaderTestRunning')}</p>
            <div class="chart-container">
                <canvas id="shader-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('shader-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translator.translate('simple'),
                    Translator.translate('medium'),
                    Translator.translate('complex'),
                    Translator.translate('veryComplex')
                ],
                datasets: [{
                    label: 'FPS',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.6)',
                        'rgba(3, 218, 198, 0.6)',
                        'rgba(93, 63, 211, 0.6)',
                        'rgba(255, 71, 87, 0.6)'
                    ],
                    borderColor: [
                        'rgb(46, 204, 113)',
                        'rgb(3, 218, 198)',
                        'rgb(93, 63, 211)',
                        'rgb(255, 71, 87)'
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
                            text: 'FPS'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('complexity')
                        }
                    }
                }
            }
        });
        
        // Start shader test sequence
        document.getElementById('shader-status').textContent = Translator.translate('testRunning');
        document.getElementById('shader-progress-bar').style.width = '0%';
        
        // Run tests for each shader complexity
        runShaderTests();
    }
    
    /**
     * Run shader tests for different complexities
     */
    function runShaderTests() {
        if (!shaderTestActive) return;
        
        // Shader types to test
        const shaderTypes = shaderResults.shaderTypes;
        let currentShaderIndex = 0;
        
        function testNextShader() {
            if (currentShaderIndex >= shaderTypes.length || !shaderTestActive) {
                // All shader tests complete
                stopShaderTest();
                return;
            }
            
            const shaderType = shaderTypes[currentShaderIndex];
            document.getElementById('shader-type').textContent = Translator.translate(shaderType);
            
            // Update progress
            const progress = (currentShaderIndex / shaderTypes.length) * 100;
            document.getElementById('shader-progress-bar').style.width = `${progress}%`;
            
            // Run test for current shader
            runShaderTest(shaderType, (result) => {
                // Store result
                shaderResults.performanceByComplexity[shaderType] = result;
                
                // Update chart
                updateShaderChart();
                
                // Move to next shader
                currentShaderIndex++;
                setTimeout(testNextShader, 500);
            });
        }
        
        // Start testing shaders
        testNextShader();
    }
    
    /**
     * Run a test for a specific shader
     * @param {string} shaderType - Type of shader to test
     * @param {Function} callback - Callback function with test result
     */
    function runShaderTest(shaderType, callback) {
        // Set up variables
        const testDuration = 3000; // 3 seconds per shader
        const startTime = performance.now();
        let lastFrameTime = startTime;
        let frameCount = 0;
        let fpsData = [];
        
        // Start rendering loop
        function render(currentTime) {
            // Calculate frame time and FPS
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            const fps = 1000 / deltaTime;
            
            // Store FPS
            fpsData.push(fps);
            
            // Update FPS counter
            document.getElementById('shader-fps').textContent = `${Math.round(fps)} FPS`;
            
            // Render shader
            renderShader(shaderGL, shaderType, currentTime - startTime);
            
            // Check if test should continue
            frameCount++;
            const elapsedTime = currentTime - startTime;
            
            if (shaderTestActive && elapsedTime < testDuration) {
                shaderAnimationId = requestAnimationFrame(render);
            } else {
                // Test complete, calculate results
                const avgFPS = StatsAnalyzer.calculateAverage(fpsData);
                const result = {
                    averageFPS: avgFPS,
                    minFPS: StatsAnalyzer.calculateMin(fpsData),
                    maxFPS: StatsAnalyzer.calculateMax(fpsData),
                    frameCount: frameCount
                };
                
                // Cancel animation
                if (shaderAnimationId) {
                    cancelAnimationFrame(shaderAnimationId);
                    shaderAnimationId = null;
                }
                
                // Call callback with result
                callback(result);
            }
        }
        
        // Start rendering
        shaderAnimationId = requestAnimationFrame(render);
    }
    
    /**
     * Render a shader
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} shaderType - Type of shader to render
     * @param {number} time - Elapsed time in ms
     */
    function renderShader(gl, shaderType, time) {
        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Get shader program
        const programInfo = shaderPrograms[shaderType];
        if (!programInfo) return;
        
        gl.useProgram(programInfo.program);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderPrograms.buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.position,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.position);
        
        // Set uniforms
        gl.uniform1f(programInfo.uniformLocations.time, time * 0.001);
        
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    
    /**
     * Update shader test chart
     */
    function updateShaderChart() {
        // Get chart
        const chart = Chart.getChart('shader-chart');
        if (!chart) return;
        
        // Get FPS data for each shader type
        const fpsData = shaderResults.shaderTypes.map(type => {
            return shaderResults.performanceByComplexity[type] ? 
                   shaderResults.performanceByComplexity[type].averageFPS : 0;
        });
        
        // Update chart
        chart.data.datasets[0].data = fpsData;
        chart.update();
    }
    
    /**
     * Stop the shader test
     */
    function stopShaderTest() {
        shaderTestActive = false;
        
        // Stop animation loop
        if (shaderAnimationId) {
            cancelAnimationFrame(shaderAnimationId);
            shaderAnimationId = null;
        }
        
        // Complete progress bar
        document.getElementById('shader-progress-bar').style.width = '100%';
        document.getElementById('shader-status').textContent = Translator.translate('testCompleted');
        document.getElementById('shader-type').textContent = '';
        
        // Calculate overall score
        calculateShaderScore();
        
        // Analyze and display results
        analyzeShaderResults();
    }
    
    /**
     * Calculate shader test score
     */
    function calculateShaderScore() {
        if (Object.keys(shaderResults.performanceByComplexity).length === 0) {
            shaderResults.complexityScore = 0;
            return;
        }
        
        // Calculate weighted score based on shader complexity
        const weights = {
            simple: 0.1,
            medium: 0.2,
            complex: 0.3,
            veryComplex: 0.4
        };
        
        // Calculate weighted average of FPS
        let totalWeight = 0;
        let weightedSum = 0;
        let totalFPS = 0;
        
        for (const [type, result] of Object.entries(shaderResults.performanceByComplexity)) {
            if (result && weights[type]) {
                weightedSum += result.averageFPS * weights[type];
                totalWeight += weights[type];
                totalFPS += result.averageFPS;
            }
        }
        
        // Average FPS across all tests
        shaderResults.averageFPS = totalFPS / Object.keys(shaderResults.performanceByComplexity).length;
        
        // Calculate complexity score (0-100)
        // We want higher scores for higher FPS, but we also want to reward performance on complex shaders
        if (totalWeight > 0) {
            const weightedAvgFPS = weightedSum / totalWeight;
            
            // Calculate score - higher weight for complex shader performance
            const simpleShaderScore = shaderResults.performanceByComplexity.simple ? 
                Math.min(100, shaderResults.performanceByComplexity.simple.averageFPS / 1.5) : 0;
                
            const complexShaderScore = shaderResults.performanceByComplexity.veryComplex ?
                Math.min(100, shaderResults.performanceByComplexity.veryComplex.averageFPS * 3) : 0;
                
            shaderResults.complexityScore = Math.round(simpleShaderScore * 0.3 + complexShaderScore * 0.7);
        } else {
            shaderResults.complexityScore = 0;
        }
        
        // Make sure score is in 0-100 range
        shaderResults.complexityScore = Math.min(100, Math.max(0, shaderResults.complexityScore));
    }
    
    /**
     * Start the texture test
     */
    function startTextureTest() {
        // Initialize test if needed
        if (!textureTestArea) {
            if (!initTextureTest()) {
                document.getElementById('texture-results').innerHTML = `
                    <h3>${Translator.translate('testError')}</h3>
                    <p>${Translator.translate('webglRequiredForTest')}</p>
                `;
                return;
            }
        }
        
        // Reset test data
        textureTestActive = true;
        textureResults = {
            loadTimeAvg: 0,
            streamingScore: 0,
            memoryUsage: 0,
            maxTextureSize: textureGL.getParameter(textureGL.MAX_TEXTURE_SIZE)
        };
        
        // Set up results container
        const resultsContainer = document.getElementById('texture-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>${Translator.translate('testInProgress')}</h3>
            <p>${Translator.translate('textureTestRunning')}</p>
            <div class="chart-container">
                <canvas id="texture-chart"></canvas>
            </div>
        `;
        
        // Initialize chart
        const ctx = document.getElementById('texture-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: Translator.translate('loadTime') + ' (ms)',
                    data: [],
                    borderColor: 'rgb(255, 152, 0)',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    borderWidth: 2,
                    tension: 0.2
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
                            text: Translator.translate('loadTimeMs')
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('textureSize')
                        }
                    }
                }
            }
        });
        
        // Start texture test
        document.getElementById('texture-status').textContent = Translator.translate('testRunning');
        document.getElementById('texture-progress-bar').style.width = '0%';
        
        // Run texture tests
        runTextureTests();
    }
    
    /**
     * Run texture tests
     */
    function runTextureTests() {
        if (!textureTestActive) return;
        
        // Define texture sizes to test (powers of 2)
        const textureSizes = [128, 256, 512, 1024, 2048, 4096];
        let currentTextureIndex = 0;
        const loadTimes = [];
        
        function testNextTexture() {
            if (currentTextureIndex >= textureSizes.length || !textureTestActive) {
                // All texture tests complete
                
                // Calculate average load time
                if (loadTimes.length > 0) {
                    textureResults.loadTimeAvg = StatsAnalyzer.calculateAverage(loadTimes);
                    
                    // Calculate streaming score based on load times
                    // Lower load times are better
                    textureResults.streamingScore = Math.round(100 - Math.min(100, textureResults.loadTimeAvg / 2));
                }
                
                stopTextureTest();
                return;
            }
            
            const textureSize = textureSizes[currentTextureIndex];
            document.getElementById('texture-info').textContent = 
                `${Translator.translate('testingTextureSize')}: ${textureSize} x ${textureSize}`;
            
            // Update progress
            const progress = (currentTextureIndex / textureSizes.length) * 100;
            document.getElementById('texture-progress-bar').style.width = `${progress}%`;
            
            // Create and load texture
            const startTime = performance.now();
            
            // Generate texture data (random colored pixels)
            const textureData = generateTextureData(textureSize, textureSize);
            
            // Create texture
            const texture = textureGL.createTexture();
            textureGL.bindTexture(textureGL.TEXTURE_2D, texture);
            
            try {
                // Upload texture data
                textureGL.texImage2D(
                    textureGL.TEXTURE_2D, 
                    0, 
                    textureGL.RGBA, 
                    textureSize, 
                    textureSize, 
                    0, 
                    textureGL.RGBA, 
                    textureGL.UNSIGNED_BYTE, 
                    textureData
                );
                
                // Set texture parameters
                textureGL.texParameteri(textureGL.TEXTURE_2D, textureGL.TEXTURE_MAG_FILTER, textureGL.LINEAR);
                textureGL.texParameteri(textureGL.TEXTURE_2D, textureGL.TEXTURE_MIN_FILTER, textureGL.LINEAR);
                textureGL.texParameteri(textureGL.TEXTURE_2D, textureGL.TEXTURE_WRAP_S, textureGL.CLAMP_TO_EDGE);
                textureGL.texParameteri(textureGL.TEXTURE_2D, textureGL.TEXTURE_WRAP_T, textureGL.CLAMP_TO_EDGE);
                
                // Measure time
                const endTime = performance.now();
                const loadTime = endTime - startTime;
                
                // Store load time
                loadTimes.push(loadTime);
                
                // Update chart
                updateTextureChart(textureSizes.slice(0, currentTextureIndex + 1), loadTimes);
                
                // Display texture
                displayTexture(textureGL, texture);
                
                // Move to next texture
                currentTextureIndex++;
                setTimeout(testNextTexture, 1000);
                
            } catch (error) {
                console.error('Error loading texture:', error);
                
                // If texture is too large, stop here
                if (error.name === 'WebGLError' || error.name === 'InvalidValueError') {
                    textureResults.maxTextureSize = textureSizes[currentTextureIndex - 1] || 0;
                    stopTextureTest();
                } else {
                    // Try next texture
                    currentTextureIndex++;
                    setTimeout(testNextTexture, 500);
                }
            }
        }
        
        // Start testing textures
        testNextTexture();
    }
    
    /**
     * Generate texture data
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @returns {Uint8Array} Texture data
     */
    function generateTextureData(width, height) {
        const data = new Uint8Array(width * height * 4);
        
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const index = (i * width + j) * 4;
                
                // Generate pattern (gradient from top-left to bottom-right)
                const r = Math.floor(255 * j / width);
                const g = Math.floor(255 * i / height);
                const b = Math.floor(255 * (i + j) / (width + height));
                
                data[index] = r;     // R
                data[index + 1] = g; // G
                data[index + 2] = b; // B
                data[index + 3] = 255; // A
            }
        }
        
        return data;
    }
    
    /**
     * Display a texture
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {WebGLTexture} texture - WebGL texture
     */
    function displayTexture(gl, texture) {
        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Get shader program
        const programInfo = shaderPrograms.texture;
        if (!programInfo) return;
        
        gl.useProgram(programInfo.program);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderPrograms.textureBuffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.position,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.position);
        
        // Bind texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderPrograms.textureBuffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(programInfo.uniformLocations.sampler, 0);
        
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    
    /**
     * Update texture test chart
     * @param {Array<number>} sizes - Texture sizes tested
     * @param {Array<number>} loadTimes - Load times for each size
     */
    function updateTextureChart(sizes, loadTimes) {
        // Get chart
        const chart = Chart.getChart('texture-chart');
        if (!chart) return;
        
        // Update chart
        chart.data.labels = sizes.map(size => `${size}x${size}`);
        chart.data.datasets[0].data = loadTimes;
        chart.update();
    }
    
    /**
     * Stop the texture test
     */
    function stopTextureTest() {
        textureTestActive = false;
        
        // Complete progress bar
        document.getElementById('texture-progress-bar').style.width = '100%';
        document.getElementById('texture-status').textContent = Translator.translate('testCompleted');
        document.getElementById('texture-info').textContent = '';
        
        // Analyze and display results
        analyzeTextureResults();
    }
    
    /**
     * Create a matrix identity
     * @returns {Float32Array} 4x4 identity matrix
     */
    function mat4Create() {
        // Create identity matrix
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    
    /**
     * Multiply two 4x4 matrices
     * @param {Float32Array} out - Output matrix
     * @param {Float32Array} a - First matrix
     * @param {Float32Array} b - Second matrix
     * @returns {Float32Array} Result matrix
     */
    function mat4Multiply(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        return out;
    }
    
    /**
     * Rotate a matrix around an axis
     * @param {Float32Array} out - Output matrix
     * @param {Float32Array} a - Input matrix
     * @param {number} rad - Angle in radians
     * @param {Array<number>} axis - Rotation axis [x, y, z]
     * @returns {Float32Array} Result matrix
     */
    function mat4Rotate(out, a, rad, axis) {
        let x = axis[0], y = axis[1], z = axis[2];
        let len = Math.sqrt(x * x + y * y + z * z);
        
        if (len < 0.000001) {
            return null;
        }
        
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;
        
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        
        // Construct rotation matrix
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        
        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        
        if (a !== out) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        
        return out;
    }
    
    /**
     * Translate a matrix
     * @param {Float32Array} out - Output matrix
     * @param {Float32Array} a - Input matrix
     * @param {Array<number>} v - Translation vector [x, y, z]
     * @returns {Float32Array} Result matrix
     */
    function mat4Translate(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            
            out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
            out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
            out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
            
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        
        return out;
    }
    
    /**
     * Create a perspective matrix
     * @param {Float32Array} out - Output matrix
     * @param {number} fovy - Field of view in radians
     * @param {number} aspect - Aspect ratio
     * @param {number} near - Near clipping plane
     * @param {number} far - Far clipping plane
     * @returns {Float32Array} Perspective matrix
     */
    function mat4Perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        
        return out;
    }
    
    /**
         * Invert a matrix
         * @param {Float32Array} out - Output matrix
         * @param {Float32Array} a - Input matrix
         * @returns {Float32Array} Inverted matrix
         */
    function mat4Invert(out, a) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        
        // Calculate determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        
        if (!det) {
            return null;
        }
        
        det = 1.0 / det;
        
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        
        return out;
    }

    /**
     * Transpose a matrix
     * @param {Float32Array} out - Output matrix
     * @param {Float32Array} a - Input matrix
     * @returns {Float32Array} Transposed matrix
     */
    function mat4Transpose(out, a) {
        // If output is same as input, we need to use a temporary variable
        if (out === a) {
            const a01 = a[1], a02 = a[2], a03 = a[3];
            const a12 = a[6], a13 = a[7];
            const a23 = a[11];
            
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a01;
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a02;
            out[9] = a12;
            out[11] = a[14];
            out[12] = a03;
            out[13] = a13;
            out[14] = a23;
        } else {
            out[0] = a[0];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a[1];
            out[5] = a[5];
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a[2];
            out[9] = a[6];
            out[10] = a[10];
            out[11] = a[14];
            out[12] = a[3];
            out[13] = a[7];
            out[14] = a[11];
            out[15] = a[15];
        }
        
        return out;
    }

    /**
     * Analyze rendering test results
     */
    function analyzeRenderingResults() {
        if (renderingResults.frameTimeData.length === 0) {
            document.getElementById('rendering-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreRenderingData')}</p>
            `;
            return;
        }
        
        // Calculate averages
        const fpsData = renderingResults.frameTimeData.map(frame => frame.fps);
        
        // Filter outliers if enabled
        let filteredFPS = fpsData;
        if (document.getElementById('filter-outliers').checked) {
            filteredFPS = StatsAnalyzer.filterOutliers(fpsData);
        }
        
        // Apply noise reduction if selected
        const noiseReductionMethod = document.getElementById('noise-reduction').value;
        if (noiseReductionMethod !== 'none') {
            filteredFPS = StatsAnalyzer.applyNoiseReduction(filteredFPS, noiseReductionMethod);
        }
        
        // Calculate statistics
        const avgFPS = StatsAnalyzer.calculateAverage(filteredFPS);
        const minFPS = StatsAnalyzer.calculateMin(filteredFPS);
        const maxFPS = StatsAnalyzer.calculateMax(filteredFPS);
        const stdDev = StatsAnalyzer.calculateStandardDeviation(filteredFPS);
        
        // Calculate stability score (higher is better, 0-100)
        const stabilityScore = Math.max(0, 100 - (stdDev / avgFPS * 100));
        
        // Calculate performance score (higher is better, 0-100)
        // Score is based on average FPS, capped at 240fps for scoring purposes
        const performanceScore = Math.min(100, avgFPS / 2.4);
        
        // Update results
        renderingResults.averageFPS = avgFPS;
        renderingResults.minFPS = minFPS;
        renderingResults.maxFPS = maxFPS;
        renderingResults.stabilityScore = stabilityScore;
        renderingResults.performanceScore = performanceScore;
        
        // Store in global test results
        window.gamePerformanceAnalyzer.testResults.rendering = {
            averageFPS: avgFPS,
            minFPS: minFPS,
            maxFPS: maxFPS,
            stabilityScore: stabilityScore,
            performanceScore: performanceScore
        };
        
        // Get ratings
        const fpsRating = StatsAnalyzer.rateMetric(avgFPS, 240, 144, 60, 30, true);
        const stabilityRating = StatsAnalyzer.rateMetric(stabilityScore, 95, 85, 75, 60, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('renderingTestResults')}</h3>
            <div class="chart-container">
                <canvas id="rendering-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('averageFPS')}</td>
                    <td>${avgFPS.toFixed(1)} FPS</td>
                    <td><span class="rating ${fpsRating.ratingClass}">${Translator.translate(fpsRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('minimumFPS')}</td>
                    <td>${minFPS.toFixed(1)} FPS</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maximumFPS')}</td>
                    <td>${maxFPS.toFixed(1)} FPS</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('fpsStability')}</td>
                    <td>${stabilityScore.toFixed(1)}%</td>
                    <td><span class="rating ${stabilityRating.ratingClass}">${Translator.translate(stabilityRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('performanceScore')}</td>
                    <td>${performanceScore.toFixed(1)}/100</td>
                    <td></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('renderingInterpretation')}</p>
        `;
        
        // Add advanced statistics if enabled
        if (document.getElementById('advanced-stats').checked) {
            const p1FPS = StatsAnalyzer.calculatePercentile(filteredFPS, 0.01);
            const p99FPS = StatsAnalyzer.calculatePercentile(filteredFPS, 0.99);
            const frameTimeAvg = 1000 / avgFPS;
            const frameTimeStdDev = (stdDev * 1000) / (avgFPS * avgFPS);
            
            html += `
            <h4>${Translator.translate('advancedStatistics')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('1percentLowFPS')}</td>
                    <td>${p1FPS.toFixed(1)} FPS</td>
                </tr>
                <tr>
                    <td>${Translator.translate('99percentHighFPS')}</td>
                    <td>${p99FPS.toFixed(1)} FPS</td>
                </tr>
                <tr>
                    <td>${Translator.translate('averageFrameTime')}</td>
                    <td>${frameTimeAvg.toFixed(2)} ms</td>
                </tr>
                <tr>
                    <td>${Translator.translate('frameTimeStdDev')}</td>
                    <td>${frameTimeStdDev.toFixed(2)} ms</td>
                </tr>
            </table>
            <p><strong>${Translator.translate('tip')}:</strong> ${Translator.translate('renderingTip')}</p>
            `;
            
            // Add debug info if enabled
            if (document.getElementById('debug-mode').checked) {
                const histogram = StatsAnalyzer.createHistogram(filteredFPS, 10);
                
                html += `
                <h4>${Translator.translate('debugData')}</h4>
                <p>${Translator.translate('fpsDistribution')}:</p>
                <div class="debug-chart-container">
                    <canvas id="rendering-histogram-chart"></canvas>
                </div>
                `;
            }
        }
        
        // Update results container
        document.getElementById('rendering-results').innerHTML = html;
        
        // Create results chart
        createRenderingResultsChart(filteredFPS);
        
        // Create histogram chart if in debug mode
        if (document.getElementById('debug-mode').checked && document.getElementById('advanced-stats').checked) {
            createRenderingHistogram(filteredFPS);
        }
        
        // Update comparison table
        window.gamePerformanceAnalyzer.updateComparisonTable();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }

    /**
     * Create rendering results chart
     * @param {Array<number>} fpsData - FPS data
     */
    function createRenderingResultsChart(fpsData) {
        // Only show up to 100 points for clarity
        const displayLimit = 100;
        const displayFPS = fpsData.slice(-displayLimit);
        
        const labels = Array.from({length: displayFPS.length}, (_, i) => i + 1);
        
        const ctx = document.getElementById('rendering-results-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'FPS',
                    data: displayFPS,
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.2)',
                    borderWidth: 2,
                    tension: 0.2
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
                            text: 'FPS'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('frame')
                        }
                    }
                }
            }
        });
    }

    /**
     * Create rendering histogram chart
     * @param {Array<number>} fpsData - FPS data
     */
    function createRenderingHistogram(fpsData) {
        const histogram = StatsAnalyzer.createHistogram(fpsData, 10);
        
        const ctx = document.getElementById('rendering-histogram-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: histogram.binEdges.slice(0, -1).map((v, i) => 
                    `${Math.floor(v)}-${Math.floor(histogram.binEdges[i+1])} FPS`),
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
                            text: Translator.translate('fpsRange')
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
     * Analyze shader test results
     */
    function analyzeShaderResults() {
        if (Object.keys(shaderResults.performanceByComplexity).length === 0) {
            document.getElementById('shader-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreShaderData')}</p>
            `;
            return;
        }
        
        // Store in global test results
        window.gamePerformanceAnalyzer.testResults.shader = {
            complexityScore: shaderResults.complexityScore,
            averageFPS: shaderResults.averageFPS,
            performanceByComplexity: shaderResults.performanceByComplexity
        };
        
        // Get ratings
        const complexityRating = StatsAnalyzer.rateMetric(shaderResults.complexityScore, 90, 75, 60, 40, true);
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('shaderTestResults')}</h3>
            <div class="chart-container">
                <canvas id="shader-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('shaderComplexityScore')}</td>
                    <td>${shaderResults.complexityScore.toFixed(1)}/100</td>
                    <td><span class="rating ${complexityRating.ratingClass}">${Translator.translate(complexityRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('averageFPS')}</td>
                    <td>${shaderResults.averageFPS.toFixed(1)} FPS</td>
                    <td></td>
                </tr>
            </table>
            <h4>${Translator.translate('shaderPerformance')}</h4>
            <table>
                <tr>
                    <th>${Translator.translate('shaderType')}</th>
                    <th>${Translator.translate('averageFPS')}</th>
                </tr>
        `;
        
        // Add results for each shader type
        for (const shaderType of shaderResults.shaderTypes) {
            if (shaderResults.performanceByComplexity[shaderType]) {
                const result = shaderResults.performanceByComplexity[shaderType];
                html += `
                <tr>
                    <td>${Translator.translate(shaderType)}</td>
                    <td>${result.averageFPS.toFixed(1)} FPS</td>
                </tr>
                `;
            }
        }
        
        html += `
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('shaderInterpretation')}</p>
        `;
        
        // Add recommendations based on score
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (shaderResults.complexityScore < 50) {
            html += `<li>${Translator.translate('shaderLowPerformanceRecommendation')}</li>`;
        } else if (shaderResults.complexityScore < 75) {
            html += `<li>${Translator.translate('shaderAveragePerformanceRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('shaderHighPerformanceRecommendation')}</li>`;
        }
        
        // Check performance drop with complexity
        if (shaderResults.performanceByComplexity.simple && shaderResults.performanceByComplexity.veryComplex) {
            const performanceDrop = shaderResults.performanceByComplexity.simple.averageFPS / 
                                shaderResults.performanceByComplexity.veryComplex.averageFPS;
            
            if (performanceDrop > 10) {
                html += `<li>${Translator.translate('shaderHighDropRecommendation')}</li>`;
            } else if (performanceDrop > 5) {
                html += `<li>${Translator.translate('shaderModerateDropRecommendation')}</li>`;
            }
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('shader-results').innerHTML = html;
        
        // Create results chart
        createShaderResultsChart();
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }

    /**
     * Create shader results chart
     */
    function createShaderResultsChart() {
        const ctx = document.getElementById('shader-results-chart').getContext('2d');
        
        // Get FPS data for each shader type
        const fpsData = [];
        const labels = [];
        const colors = [
            'rgba(46, 204, 113, 0.6)',
            'rgba(3, 218, 198, 0.6)',
            'rgba(93, 63, 211, 0.6)',
            'rgba(255, 71, 87, 0.6)'
        ];
        const borderColors = [
            'rgb(46, 204, 113)',
            'rgb(3, 218, 198)',
            'rgb(93, 63, 211)',
            'rgb(255, 71, 87)'
        ];
        
        for (let i = 0; i < shaderResults.shaderTypes.length; i++) {
            const type = shaderResults.shaderTypes[i];
            if (shaderResults.performanceByComplexity[type]) {
                fpsData.push(shaderResults.performanceByComplexity[type].averageFPS);
                labels.push(Translator.translate(type));
            }
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'FPS',
                    data: fpsData,
                    backgroundColor: colors.slice(0, fpsData.length),
                    borderColor: borderColors.slice(0, fpsData.length),
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
                            text: 'FPS'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('shaderComplexity')
                        }
                    }
                }
            }
        });
    }

    /**
     * Analyze texture test results
     */
    function analyzeTextureResults() {
        if (textureResults.maxTextureSize === 0) {
            document.getElementById('texture-results').innerHTML = `
                <h3>${Translator.translate('insufficientData')}</h3>
                <p>${Translator.translate('needMoreTextureData')}</p>
            `;
            return;
        }
        
        // Store in global test results
        window.gamePerformanceAnalyzer.testResults.texture = textureResults;
        
        // Get ratings
        const streamingRating = StatsAnalyzer.rateMetric(textureResults.streamingScore, 90, 75, 60, 40, true);
        const maxTextureSizeRating = StatsAnalyzer.rateMetric(
            Math.min(100, textureResults.maxTextureSize / 40.96), // Scale to 0-100 (4096 = 100)
            90, 75, 60, 40, true
        );
        
        // Create HTML for results
        let html = `
            <h3>${Translator.translate('textureTestResults')}</h3>
            <div class="chart-container">
                <canvas id="texture-results-chart"></canvas>
            </div>
            <table>
                <tr>
                    <th>${Translator.translate('parameter')}</th>
                    <th>${Translator.translate('value')}</th>
                    <th>${Translator.translate('rating')}</th>
                </tr>
                <tr>
                    <td>${Translator.translate('textureStreamingScore')}</td>
                    <td>${textureResults.streamingScore.toFixed(1)}/100</td>
                    <td><span class="rating ${streamingRating.ratingClass}">${Translator.translate(streamingRating.rating.toLowerCase())}</span></td>
                </tr>
                <tr>
                    <td>${Translator.translate('averageLoadTime')}</td>
                    <td>${textureResults.loadTimeAvg.toFixed(2)} ms</td>
                    <td></td>
                </tr>
                <tr>
                    <td>${Translator.translate('maxTextureSize')}</td>
                    <td>${textureResults.maxTextureSize} x ${textureResults.maxTextureSize}</td>
                    <td><span class="rating ${maxTextureSizeRating.ratingClass}">${Translator.translate(maxTextureSizeRating.rating.toLowerCase())}</span></td>
                </tr>
            </table>
            <p><strong>${Translator.translate('interpretation')}:</strong> ${Translator.translate('textureInterpretation')}</p>
        `;
        
        // Add recommendations
        html += `
        <h4>${Translator.translate('recommendations')}</h4>
        <ul>
        `;
        
        if (textureResults.streamingScore < 60) {
            html += `<li>${Translator.translate('textureLowPerformanceRecommendation')}</li>`;
        } else if (textureResults.streamingScore < 80) {
            html += `<li>${Translator.translate('textureAveragePerformanceRecommendation')}</li>`;
        } else {
            html += `<li>${Translator.translate('textureHighPerformanceRecommendation')}</li>`;
        }
        
        if (textureResults.maxTextureSize < 2048) {
            html += `<li>${Translator.translate('textureSizeLimitationRecommendation')}</li>`;
        }
        
        html += `</ul>`;
        
        // Update results container
        document.getElementById('texture-results').innerHTML = html;
        
        // If we have load time data, create results chart
        if (textureResults.loadTimeAvg > 0) {
            createTextureResultsChart();
        }
        
        // Check if all tests completed
        window.gamePerformanceAnalyzer.checkAllTestsCompleted();
    }

    /**
     * Create texture results chart
     */
    function createTextureResultsChart() {
        const ctx = document.getElementById('texture-results-chart').getContext('2d');
        
        // Create example data for different texture sizes
        const textureSizes = [128, 256, 512, 1024, 2048, Math.min(4096, textureResults.maxTextureSize)];
        
        // Create a model for load times based on the average
        // Typically, load time increases exponentially with texture size
        const loadTimes = textureSizes.map(size => {
            const factor = (size / 512) ** 2; // Square relationship
            return textureResults.loadTimeAvg * factor * 0.5;
        });
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: textureSizes.map(size => `${size}x${size}`),
                datasets: [{
                    label: Translator.translate('estimatedLoadTime') + ' (ms)',
                    data: loadTimes,
                    borderColor: 'rgb(255, 152, 0)',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    borderWidth: 2,
                    tension: 0.2
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
                            text: Translator.translate('loadTimeMs')
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: Translator.translate('textureSize')
                        }
                    }
                }
            }
        });
    }

    // Public API
    return {
        startRenderingTest,
        stopRenderingTest,
        startShaderTest,
        stopShaderTest,
        startTextureTest,
        stopTextureTest
    };
})();