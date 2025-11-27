
    <script>
        // Variables globales
        let allChannels = [];
        let currentHeroIndex = 0;
        let heroInterval;
        let currentFilter = 'all';
        let renderedChannels = [];
        let loadedFromCache = false;
        
        const MAX_CHANNELS_RENDER = 8000;
        const SPANISH_KEYWORDS = ['español', 'spain', 'méxico', 'argentina', 'colombia', 'perú', 'chile', 'latino', 'telemundo', 'univision', 'caracol', 'rtve'];
        
        // Configuración de caché
        const CACHE_VERSION = 'v5_latino'; // Con nuevos canales LATINO hardcoded
        const CACHE_KEYS = {
            CHANNELS: `iptv_channels_${CACHE_VERSION}`,
            TIMESTAMP: `iptv_timestamp_${CACHE_VERSION}`
        };
        const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        // Verificar si el caché es válido
        function isCacheValid() {
            const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
            if (!timestamp) return false;
            
            const age = Date.now() - parseInt(timestamp);
            return age < CACHE_EXPIRY;
        }
        
        // Guardar canales en caché
        function saveChannelsToCache(channels) {
            try {
                localStorage.setItem(CACHE_KEYS.CHANNELS, JSON.stringify(channels));
                localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
                console.log('💾 Canales guardados en caché');
            } catch (e) {
                console.warn('⚠️ No se pudo guardar en caché:', e);
            }
        }
        
        // Cargar canales desde caché
        function loadChannelsFromCache() {
            try {
                const cached = localStorage.getItem(CACHE_KEYS.CHANNELS);
                if (!cached) return null;
                
                const channels = JSON.parse(cached);
                console.log(`✅ Cargados ${channels.length} canales desde caché`);
                return channels;
            } catch (e) {
                console.warn('⚠️ Error leyendo caché:', e);
                return null;
            }
        }
        
        // Cargar canales desde M3U
        async function loadChannels() {
            try {
                // Intentar cargar desde caché primero
                if (isCacheValid()) {
                    const cachedChannels = loadChannelsFromCache();
                    if (cachedChannels && cachedChannels.length > 0) {
                        allChannels = cachedChannels;
                        loadedFromCache = true;
                        console.log('⚡ Carga rápida desde caché activada');
                        processChannels();
                        return;
                    }
                }
                
                // Si no hay caché válido, cargar desde la red
                console.log('🌐 Descargando canales desde múltiples fuentes...');
                
                let channels1 = [];
                let channels2 = [];
                let channels3 = [];
                
                // Cargar lista principal (IPTV-ORG)
                try {
                    const response1 = await fetch('https://iptv-org.github.io/iptv/index.m3u');
                    const m3uText1 = await response1.text();
                    channels1 = parseM3U(m3uText1);
                    console.log(`✅ Cargados ${channels1.length} canales de IPTV-ORG`);
                } catch (error) {
                    console.error('❌ Error cargando IPTV-ORG:', error);
                }
                
                // Cargar lista LATINO (hardcoded para mayor velocidad y evitar CORS)
                const latinoM3U = `#EXTM3U
#EXTINF:-1,AZTECA 7 FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=80&f=.ts
#EXTINF:-1,CANAL 5 FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=81&f=.ts
#EXTINF:-1,EL TRECE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=82&f=.ts
#EXTINF:-1,TELEFE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=83&f=.ts
#EXTINF:-1,TV PUBLICA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=84&f=.ts
#EXTINF:-1,TELEMUNDO 51 FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=85&f=.ts
#EXTINF:-1,TELEMUNDO PUERTO RICO
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=86&f=.ts
#EXTINF:-1,TELEMUNDO INTERNACIONAL
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=87&f=.ts
#EXTINF:-1,UNIVISION FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=88&f=.ts
#EXTINF:-1,PASIONES FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=89&f=.ts
#EXTINF:-1,SALVADOR TCS PLUS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=95&f=.ts
#EXTINF:-1,RTS ECUADOR
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=96&f=.ts
#EXTINF:-1,SONY CINE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=99&f=.ts
#EXTINF:-1,SONY MOVIES
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=100&f=.ts
#EXTINF:-1,ECUADOR TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=101&f=.ts
#EXTINF:-1,SUN CHANNEL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=102&f=.ts
#EXTINF:-1,CANAL N FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=103&f=.ts
#EXTINF:-1,TN ARGENTINA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=104&f=.ts
#EXTINF:-1,C5N FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=105&f=.ts
#EXTINF:-1,AMERICA TV ARGENTINA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=106&f=.ts
#EXTINF:-1,LA NACION ARGENTINA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=107&f=.ts
#EXTINF:-1,EL NUEVE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=108&f=.ts
#EXTINF:-1,A24 ARGENTINA
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=109&f=.ts
#EXTINF:-1,MTV 00S FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=113&f=.ts
#EXTINF:-1,LOVE NATURE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=114&f=.ts
#EXTINF:-1,TELE AMAZONAS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=115&f=.ts
#EXTINF:-1,EUROPA EUROPA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=116&f=.ts
#EXTINF:-1,RCN FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=117&f=.ts
#EXTINF:-1,DHE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=118&f=.ts
#EXTINF:-1,FM HOT KIDS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=119&f=.ts
#EXTINF:-1,FM HOT MOVIES FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=120&f=.ts
#EXTINF:-1,UNIVERSAL CINEMA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=121&f=.ts
#EXTINF:-1,TNT NOVELAS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=122&f=.ts
#EXTINF:-1,UNIVERSAL PREMIERE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=123&f=.ts
#EXTINF:-1,DPELICULA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=124&f=.ts
#EXTINF:-1,DISNEY CHANNEL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=125&f=.ts
#EXTINF:-1,TELEMUNDO INTERNACIONAL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=126&f=.ts
#EXTINF:-1,WARNER BROS TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=127&f=.ts
#EXTINF:-1,EXTREMA TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=128&f=.ts
#EXTINF:-1,ANTENA 3 FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=129&f=.ts
#EXTINF:-1,PANICO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=130&f=.ts
#EXTINF:-1,GOLDEN FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=131&f=.ts
#EXTINF:-1,DW ESPAÑOL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=132&f=.ts
#EXTINF:-1,GLOBAL TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=133&f=.ts
#EXTINF:-1,WILLAX TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=134&f=.ts
#EXTINF:-1,TELEMUNDO PUERTO RICO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=135&f=.ts
#EXTINF:-1,DISCOVERY KIDS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=136&f=.ts
#EXTINF:-1,TOONCAST FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=137&f=.ts
#EXTINF:-1,CARTOONITO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=138&f=.ts
#EXTINF:-1,CARTOON NETWORK FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=139&f=.ts
#EXTINF:-1,NICK JR FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=140&f=.ts
#EXTINF:-1,NICK FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=141&f=.ts
#EXTINF:-1,DISNEY JR FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=142&f=.ts
#EXTINF:-1,EL GOURMET FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=143&f=.ts
#EXTINF:-1,LIFETIME FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=144&f=.ts
#EXTINF:-1,EVERYTHING FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=145&f=.ts
#EXTINF:-1,DISCOVERY WORLD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=146&f=.ts
#EXTINF:-1,DISCOVERY THEATER
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=147&f=.ts
#EXTINF:-1,DISCOVERY TLC FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=148&f=.ts
#EXTINF:-1,DISCOVERY A&E
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=149&f=.ts
#EXTINF:-1,ID INVESTIGATION FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=150&f=.ts
#EXTINF:-1,DISCOVERY HYH FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=151&f=.ts
#EXTINF:-1,DISCOVERY TURBO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=152&f=.ts
#EXTINF:-1,DISCOVERY CHANNEL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=153&f=.ts
#EXTINF:-1,ANIMAL PLANET FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=154&f=.ts
#EXTINF:-1,NAT GEO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=155&f=.ts
#EXTINF:-1,COMEDY CENTRAL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=156&f=.ts
#EXTINF:-1,MTV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=157&f=.ts
#EXTINF:-1,PARAMOUNT CHANNEL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=158&f=.ts
#EXTINF:-1,AMC FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=159&f=.ts
#EXTINF:-1,MULTIPREMIER FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=160&f=.ts
#EXTINF:-1,STUDIO UNIVERSAL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=161&f=.ts
#EXTINF:-1,UNIVERSAL TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=162&f=.ts
#EXTINF:-1,AXN FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=163&f=.ts
#EXTINF:-1,CANAL SONY FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=164&f=.ts
#EXTINF:-1,TNT SERIES FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=165&f=.ts
#EXTINF:-1,GOLDEN PREMIER FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=166&f=.ts
#EXTINF:-1,GOLDEN EDGE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=168&f=.ts
#EXTINF:-1,GOLDEN PLUS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=169&f=.ts
#EXTINF:-1,GOLDEN FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=170&f=.ts
#EXTINF:-1,FX FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=171&f=.ts
#EXTINF:-1,IMAGEN TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=172&f=.ts
#EXTINF:-1,UNICABLE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=173&f=.ts
#EXTINF:-1,UNIVISION FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=174&f=.ts
#EXTINF:-1,ATV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=175&f=.ts
#EXTINF:-1,CARACOL TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=176&f=.ts
#EXTINF:-1,SYFY USA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=177&f=.ts
#EXTINF:-1,LAS ESTRELLAS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=178&f=.ts
#EXTINF:-1,TLNOVELAS FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=179&f=.ts
#EXTINF:-1,GALAVISION FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=180&f=.ts
#EXTINF:-1,AZTECA INTERNACIONAL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=181&f=.ts
#EXTINF:-1,AZTECA UNO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=182&f=.ts
#EXTINF:-1,HISTORY 2 FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=183&f=.ts
#EXTINF:-1,HISTORY FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=184&f=.ts
#EXTINF:-1,DISTRITO COMEDIA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=186&f=.ts
#EXTINF:-1,CINECANAL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=187&f=.ts
#EXTINF:-1,CINEMAX FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=188&f=.ts
#EXTINF:-1,STAR CHANNEL FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=189&f=.ts
#EXTINF:-1,TNT FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=190&f=.ts
#EXTINF:-1,SPACE FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=191&f=.ts
#EXTINF:-1,AMERICA TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=192&f=.ts
#EXTINF:-1,LATINA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=193&f=.ts
#EXTINF:-1,TELECINCO FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=195&f=.ts
#EXTINF:-1,TEEN NICK FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=196&f=.ts
#EXTINF:-1,TELEHIT FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=197&f=.ts
#EXTINF:-1,TELEHIT MUSICA FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=198&f=.ts
#EXTINF:-1,TCM FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=199&f=.ts
#EXTINF:-1,GEX TV FHD
https://live.saohgdasregions.fun/Y6gMx4s18]WB.php?stream=200&f=.ts`;
                
                channels2 = parseM3U(latinoM3U);
                // Marcar canales de la lista latino
                channels2.forEach(ch => ch.source = 'latino');
                console.log(`✅ Cargados ${channels2.length} canales LATINO (hardcoded)`);
                
                // Cargar lista DEPORTES (hardcoded para mayor velocidad)
                const deportesM3U = `#EXTM3U
#EXTINF:-1,TUDN FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=16&f=.ts
#EXTINF:-1,GOL PERU FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=7&f=.ts
#EXTINF:-1,TNT SPORTS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=11&f=.ts
#EXTINF:-1,ESPN PREMIUM FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=12&f=.ts
#EXTINF:-1,TYC SPORTS ARGENTINA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=206&f=.ts
#EXTINF:-1,TYC SPORTS INTERNACIONAL FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=207&f=.ts
#EXTINF:-1,FOX SPORTS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=19&f=.ts
#EXTINF:-1,FOX SPORTS 2 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=20&f=.ts
#EXTINF:-1,FOX SPORTS 3 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=22&f=.ts
#EXTINF:-1,ESPN FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=26&f=.ts
#EXTINF:-1,ESPN 2 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=28&f=.ts
#EXTINF:-1,ESPN 3 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=29&f=.ts
#EXTINF:-1,DIRECTV SPORTS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=32&f=.ts
#EXTINF:-1,DIRECTV SPORTS 2 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=33&f=.ts
#EXTINF:-1,DIRECTV SPORTS PLUS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=34&f=.ts
#EXTINF:-1,FOX SPORTS MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=35&f=.ts
#EXTINF:-1,FOX SPORTS 2 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=36&f=.ts
#EXTINF:-1,FOX SPORTS 3 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=37&f=.ts
#EXTINF:-1,ESPN MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=41&f=.ts
#EXTINF:-1,ESPN 2 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=46&f=.ts
#EXTINF:-1,ESPN 3 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=48&f=.ts
#EXTINF:-1,LIGA 1 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=49&f=.ts
#EXTINF:-1,LIGA 1 MAX FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=50&f=.ts
#EXTINF:-1,FOX SPORTS PREMIUM FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=65&f=.ts
#EXTINF:-1,ESPN 5 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=66&f=.ts
#EXTINF:-1,ESPN 6 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=67&f=.ts
#EXTINF:-1,ESPN 7 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=68&f=.ts
#EXTINF:-1,DAZN F1 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=69&f=.ts
#EXTINF:-1,MOVISTAR LIGA DE CAMPEONES FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=70&f=.ts
#EXTINF:-1,BEIN SPORTS XTRA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=71&f=.ts
#EXTINF:-1,MOVISTAR LA LIGA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=72&f=.ts
#EXTINF:-1,WIN SPORTS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=73&f=.ts
#EXTINF:-1,ESPN 4 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=74&f=.ts
#EXTINF:-1,ESPN 5 MEXICO FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=75&f=.ts
#EXTINF:-1,AZTECA DEPORTES FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=76&f=.ts
#EXTINF:-1,TNT SPORTS CHILE FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=77&f=.ts
#EXTINF:-1,SKY SPORTS LA LIGA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=78&f=.ts
#EXTINF:-1,SKY SPORTS BUNDESLIGA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=79&f=.ts
#EXTINF:-1,DAZN LA LIGA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=82&f=.ts
#EXTINF:-1,WIN SPORTS PLUS FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=83&f=.ts
#EXTINF:-1,ESPN 4 FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=84&f=.ts
#EXTINF:-1,ESPN ARGENTINA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=85&f=.ts
#EXTINF:-1,ESPN PREMIUM ARGENTINA FHD
https://deportes.ksdjugfsddeports.com/Y6gMx4s18]WB.php?stream=86&f=.ts`;
                
                channels3 = parseM3U(deportesM3U);
                channels3.forEach(ch => ch.source = 'deportes');
                console.log(`⚽ Cargados ${channels3.length} canales DEPORTES (hardcoded)`);
                
                // Combinar todas las listas (al menos una debería funcionar)
                allChannels = [...channels1, ...channels2, ...channels3];
                
                if (allChannels.length === 0) {
                    throw new Error('No se pudieron cargar canales de ninguna fuente');
                }
                
                // Agregar logos a canales de deportes desde otras listas
                const channelsWithLogos = [...channels1, ...channels2];
                channels3.forEach(deporteChannel => {
                    if (!deporteChannel.logo) {
                        const channelName = deporteChannel.name.toLowerCase();
                        
                        // Buscar canal similar en las otras listas
                        const similarChannel = channelsWithLogos.find(c => {
                            if (!c.logo) return false;
                            const cName = c.name.toLowerCase();
                            
                            // Buscar coincidencias por palabras clave
                            const keywords = channelName.split(' ').filter(w => w.length > 3);
                            return keywords.some(keyword => cName.includes(keyword));
                        });
                        
                        if (similarChannel) {
                            deporteChannel.logo = similarChannel.logo;
                            console.log(`🔍 Logo encontrado para ${deporteChannel.name}: ${similarChannel.name}`);
                        } else {
                            // Logos genéricos por cadena
                            if (channelName.includes('espn')) {
                                deporteChannel.logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png';
                            } else if (channelName.includes('fox sports')) {
                                deporteChannel.logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Fox_Sports_logo.svg/512px-Fox_Sports_logo.svg.png';
                            } else if (channelName.includes('directv')) {
                                deporteChannel.logo = 'https://i.imgur.com/PRijvR0.png';
                            } else if (channelName.includes('tyc')) {
                                deporteChannel.logo = 'https://i.imgur.com/2p1T0Xv.png';
                            } else if (channelName.includes('tudn')) {
                                deporteChannel.logo = 'https://i.imgur.com/oT5CAvd.png';
                            } else if (channelName.includes('gol')) {
                                deporteChannel.logo = 'https://i.imgur.com/uzU2nXo.png';
                            } else if (channelName.includes('tnt')) {
                                deporteChannel.logo = 'https://i.imgur.com/Bv1E8Sw.png';
                            } else if (channelName.includes('win sports')) {
                                deporteChannel.logo = 'https://i.imgur.com/xv9J5Ye.png';
                            } else if (channelName.includes('liga 1')) {
                                deporteChannel.logo = 'https://i.imgur.com/fsUiqYg.png';
                            } else if (channelName.includes('dazn')) {
                                deporteChannel.logo = 'https://i.imgur.com/fVYPHdK.png';
                            } else if (channelName.includes('movistar')) {
                                deporteChannel.logo = 'https://i.imgur.com/BuMQ8CY.png';
                            } else if (channelName.includes('bein')) {
                                deporteChannel.logo = 'https://i.imgur.com/vbHuLIJ.png';
                            } else if (channelName.includes('azteca')) {
                                deporteChannel.logo = 'https://i.imgur.com/UNJ3VlB.png';
                            } else if (channelName.includes('sky sports')) {
                                deporteChannel.logo = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Sky_Sports_logo_2020.svg/512px-Sky_Sports_logo_2020.svg.png';
                            }
                        }
                    }
                });
                
                console.log(`📺 Total: ${allChannels.length} canales cargados`);
                
                // Guardar en caché
                saveChannelsToCache(allChannels);
                loadedFromCache = false;
                
                processChannels();
                
            } catch (error) {
                console.error('Error cargando canales:', error);
                document.getElementById('hero-title').textContent = 'ERROR';
            }
        }
        
        // Limpiar caché
        function clearCache() {
            localStorage.removeItem(CACHE_KEYS.CHANNELS);
            localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
            console.log('🗑️ Caché limpiado');
            alert('Caché limpiado. Recarga la página para descargar datos frescos.');
        }
        
        // Mostrar indicador de caché
        function updateCacheIndicator(fromCache) {
            const indicator = document.getElementById('cache-indicator');
            if (fromCache) {
                const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
                const date = new Date(parseInt(timestamp));
                indicator.textContent = `📦 Caché: ${date.toLocaleString()}`;
                indicator.style.cursor = 'pointer';
                indicator.title = 'Click para limpiar caché';
                indicator.onclick = () => {
                    if (confirm('¿Limpiar caché y recargar datos frescos?')) {
                        clearCache();
                        location.reload();
                    }
                };
            } else {
                indicator.textContent = '🌐 Datos frescos';
            }
        }
        
        // Procesar canales (común para caché y red)
        function processChannels() {
            // Actualizar indicador
            updateCacheIndicator(loadedFromCache);
            
            // Trabajar con todos los canales disponibles (se asignará placeholder si falta logo)
            const channelsWithLogo = allChannels.filter(ch => ch && ch.url);
            
            // Separar por fuente
            const deportesChannels = channelsWithLogo.filter(ch => ch.source === 'deportes');
            const latinoChannels = channelsWithLogo.filter(ch => ch.source === 'latino');
            const regularChannels = channelsWithLogo.filter(ch => !ch.source || ch.source === undefined);
            
            // Priorizar canales en español dentro de regulares
            const spanishKeywords = ['español', 'spain', 'méxico', 'argentina', 'colombia', 'perú', 'chile', 'latino', 'telemundo', 'univision', 'caracol', 'rtve'];
            const spanishChannels = regularChannels.filter(channel =>
                spanishKeywords.some(keyword => 
                    channel.name.toLowerCase().includes(keyword) || 
                    (channel.groupTitle && channel.groupTitle.toLowerCase().includes(keyword))
                )
            );
            const otherChannels = regularChannels.filter(ch => !spanishChannels.includes(ch));
            
            // Orden final: DEPORTES → ESPAÑOL → LATINO → RESTO
            renderedChannels = [...deportesChannels, ...spanishChannels, ...latinoChannels, ...otherChannels];
            renderedChannels = renderedChannels.slice(0, MAX_CHANNELS_RENDER);
            
            console.log(`⚽ Canales DEPORTES: ${deportesChannels.length}`);
            console.log(`🇪🇸 Canales ESPAÑOL: ${spanishChannels.length}`);
            console.log(`🌎 Canales LATINO: ${latinoChannels.length}`);
            console.log(`🌍 Otros canales: ${otherChannels.length}`);
            console.log(`📺 Total: ${renderedChannels.length} canales`);
            
            // Inicializar hero con canales en español o deportes
            const heroChannels = deportesChannels.length > 0 ? deportesChannels.slice(0, 10) : spanishChannels.slice(0, 10);
            initializeHero(heroChannels);
            
            // Renderizar todos los canales
            renderAllChannels();
            
            // Configurar filtros
            setupFilters();
        }
        
        // Parser M3U
        function parseM3U(m3uText) {
            const lines = m3uText.split('\n');
            const channels = [];
            let currentChannel = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('#EXTINF:')) {
                    currentChannel = {
                        name: '',
                        logo: '',
                        groupTitle: '',
                        url: ''
                    };
                    
                    // Extraer logo
                    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
                    if (logoMatch) currentChannel.logo = logoMatch[1];
                    
                    // Extraer grupo
                    const groupMatch = line.match(/group-title="([^"]*)"/);
                    if (groupMatch) currentChannel.groupTitle = groupMatch[1];
                    
                    // Extraer nombre (después de la última coma)
                    const nameMatch = line.split(',');
                    if (nameMatch.length > 1) {
                        currentChannel.name = nameMatch[nameMatch.length - 1].trim();
                    }
                    
                } else if (line && !line.startsWith('#') && currentChannel) {
                    currentChannel.url = line;
                    if (currentChannel.name && currentChannel.url) {
                        channels.push(currentChannel);
                    }
                    currentChannel = null;
                }
            }
            
            return channels;
        }
        
        // Inicializar hero dinámico
        function initializeHero(heroChannels) {
            if (heroChannels.length === 0) return;
            
            function updateHero() {
                const channel = heroChannels[currentHeroIndex];
                const bgLayer = document.querySelector('.background-layer');
                const heroTitle = document.getElementById('hero-title');
                const heroCategory = document.getElementById('hero-category');
                const playBtn = document.getElementById('hero-play-btn');
                
                // Actualizar fondo
                if (channel.logo) {
                    bgLayer.style.backgroundImage = `url('${channel.logo}')`;
                }
                
                // Actualizar título
                const cleanName = channel.name.replace(/\[.*?\]/g, '').trim();
                heroTitle.textContent = cleanName.toUpperCase();
                
                // Actualizar categoría
                heroCategory.textContent = channel.groupTitle || 'TV en Vivo';
                
                // Actualizar botón play
                playBtn.onclick = () => playChannel(channel.url, channel.name);
                
                currentHeroIndex = (currentHeroIndex + 1) % heroChannels.length;
            }
            
            updateHero();
            heroInterval = setInterval(updateHero, 5000);
        }
        
        // Renderizar todos los canales
        function renderAllChannels() {
            const channelsList = document.getElementById('channels-list');
            channelsList.innerHTML = '';
            
            renderedChannels.forEach((channel, index) => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.tabIndex = 0;
                card.dataset.channelUrl = channel.url;
                card.dataset.channelIndex = index;
                card.dataset.source = channel.source || 'global';
                
                const cleanName = channel.name.replace(/\[.*?\]/g, '').trim();
                
                card.innerHTML = `
                    <img src="${channel.logo || 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(cleanName)}" 
                         alt="${cleanName}"
                         onerror="this.src='https://via.placeholder.com/200x300?text=' + encodeURIComponent('${cleanName}')">
                `;
                
                card.onclick = () => playChannel(channel.url, channel.name);
                channelsList.appendChild(card);
            });
            
            applyCurrentFilter();
        }
        
        // Actualizar contadores de canales
        function updateCounters(visibleCount = renderedChannels.length) {
            const totalAvailable = renderedChannels.length;
            document.getElementById('online-count').textContent = totalAvailable;
            document.getElementById('total-count').textContent = visibleCount;
        }
        
        // Configurar filtros de navegación
        function setupFilters() {
            const filterAll = document.getElementById('filter-all');
            const filterOnline = document.getElementById('filter-online');
            const filterOffline = document.getElementById('filter-offline');
            const filterSpanish = document.getElementById('filter-spanish');
            const filterLatino = document.getElementById('filter-latino');
            const filterDeportes = document.getElementById('filter-deportes');
            
            filterAll.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterAll);
                currentFilter = 'all';
                applyCurrentFilter();
            });
            
            filterOnline.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterOnline);
                currentFilter = 'online';
                applyCurrentFilter();
            });
            
            filterOffline.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterOffline);
                currentFilter = 'offline';
                applyCurrentFilter();
            });
            
            filterSpanish.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterSpanish);
                currentFilter = 'spanish';
                applyCurrentFilter();
            });
            
            filterLatino.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterLatino);
                currentFilter = 'latino';
                applyCurrentFilter();
            });
            
            filterDeportes.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveFilter(filterDeportes);
                currentFilter = 'deportes';
                applyCurrentFilter();
            });
        }
        
        function setActiveFilter(activeElement) {
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            activeElement.classList.add('active');
        }
        
        function applyCurrentFilter() {
            const cards = document.querySelectorAll('.movie-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const channelIndex = parseInt(card.dataset.channelIndex, 10);
                const channel = renderedChannels[channelIndex];
                let shouldShow = true;
                
                switch (currentFilter) {
                    case 'spanish':
                        shouldShow = isSpanishChannel(channel);
                        break;
                    case 'latino':
                        shouldShow = channel && channel.source === 'latino';
                        break;
                    case 'deportes':
                        shouldShow = channel && channel.source === 'deportes';
                        break;
                    case 'offline':
                        shouldShow = false;
                        break;
                    case 'online':
                    case 'all':
                    default:
                        shouldShow = true;
                        break;
                }
                
                card.style.display = shouldShow ? 'flex' : 'none';
                if (shouldShow) visibleCount++;
            });
            
            updateCounters(visibleCount);
        }
        
        function isSpanishChannel(channel) {
            if (!channel) return false;
            const name = (channel.name || '').toLowerCase();
            const group = (channel.groupTitle || '').toLowerCase();
            return SPANISH_KEYWORDS.some(keyword => name.includes(keyword) || group.includes(keyword));
        }
        
        // Variables del player (simplificadas para ExoPlayer)
        let loadingTimeout;
        
        // Reproducir canal (abre en ExoPlayer automáticamente)
        function playChannel(url, name) {
            const overlay = document.getElementById('loading-overlay');
            const channelNameEl = document.getElementById('loading-channel-name');
            
            const cleanName = name.replace(/\[.*?\]/g, '').trim();
            
            // Mostrar overlay de carga
            overlay.classList.add('active');
            channelNameEl.textContent = cleanName;
            
            console.log(`📺 Abriendo canal: ${cleanName}`);
            console.log(`🔗 URL: ${url}`);
            
            // La app con ExoPlayer detectará automáticamente el intento de reproducción de M3U8
            // y abrirá la URL en ExoPlayer
            
            // Ocultar overlay después de 2 segundos (tiempo para que se abra ExoPlayer)
            clearTimeout(loadingTimeout);
            loadingTimeout = setTimeout(() => {
                overlay.classList.remove('active');
            }, 2000);
        }
        
        // Inicializar
        loadChannels();
        
        document.addEventListener('DOMContentLoaded', () => {
            // Select all interactive elements in the desired order of "zones"
            // We will use a spatial navigation approach which is more robust for TV interfaces
            const focusableSelectors = [
                '.nav-links a',
                '.nav-icons .icon-btn',
                '.profile-icon',
                '.hero-actions button',
                '.movie-card'
            ];

            const getFocusables = () => {
                const elements = Array.from(document.querySelectorAll(focusableSelectors.join(', ')));
                // Filter out invisible elements if any
                return elements.filter(el => el.offsetParent !== null);
            };

            // Initialize focus on the first element (Dashboard)
            setTimeout(() => {
                const focusables = getFocusables();
                if (focusables.length > 0) {
                    focusables[0].focus();
                    focusables[0].classList.add('focused');
                }
            }, 500);

            // Handle Key Navigation
            document.addEventListener('keydown', (e) => {
                const key = e.key;
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) return;

                e.preventDefault(); // Prevent default scrolling

                const current = document.activeElement;
                if (!current || !getFocusables().includes(current)) {
                    // If focus is lost, reset to first
                    if (focusables.length > 0) focusables[0].focus();
                    return;
                }

                const all = getFocusables();
                const currentIndex = all.indexOf(current);

                if (key === 'Enter') {
                    current.click();
                    return;
                }

                moveFocus(current, key);
            });

            function moveFocus(current, direction) {
                const all = getFocusables();
                const rect = current.getBoundingClientRect();
                const center = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                let bestCandidate = null;
                let minDistance = Infinity;

                all.forEach(candidate => {
                    if (candidate === current) return;

                    const cRect = candidate.getBoundingClientRect();
                    const cCenter = {
                        x: cRect.left + cRect.width / 2,
                        y: cRect.top + cRect.height / 2
                    };

                    // Direction filtering
                    let isValid = false;
                    let dist = Infinity;

                    // Weights for axis alignment vs direct distance
                    // We penalize misalignment on the non-primary axis to prefer "straight" moves
                    const dx = cCenter.x - center.x;
                    const dy = cCenter.y - center.y;

                    switch (direction) {
                        case 'ArrowRight':
                            if (dx > 0) isValid = true;
                            break;
                        case 'ArrowLeft':
                            if (dx < 0) isValid = true;
                            break;
                        case 'ArrowDown':
                            if (dy > 0) isValid = true;
                            break;
                        case 'ArrowUp':
                            if (dy < 0) isValid = true;
                            break;
                    }

                    if (isValid) {
                        dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestCandidate = candidate;
                        }
                    }
                });

                if (bestCandidate) {
                    bestCandidate.focus();
                    // Optional: scroll into view if needed (though we have overflow hidden on body, the list might need scrolling)
                    bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

                    // Toggle classes for styling if needed (though :focus is best)
                    // We can remove 'focused' class from all and add to new
                    all.forEach(el => el.classList.remove('focused'));
                    bestCandidate.classList.add('focused');
                }
            }

            // Add mouseover support to update focus state (hybrid usage)
            getFocusables().forEach(el => {
                el.addEventListener('mouseenter', () => {
                    el.focus();
                    getFocusables().forEach(e => e.classList.remove('focused'));
                    el.classList.add('focused');
                });
            });
        });
    
