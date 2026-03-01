const fs = require('fs');
const path = require('path');
const exifr = require('exifr');

// ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// middleware that parses EXIF data and enforces that the photo was just taken with the camera
// at (approx) the same time and location as the reported problem. This helps prevent gallery uploads.
exports.verifyLivePhoto = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'A photo file is required and must be captured live from the camera.' });
    }

    try {
        // parse ALL metadata, including GPS and timestamp
        const metadata = await exifr.parse(req.file.buffer, { xmp: true, tiff: true, ifd0: true, exif: true, gps: true, interop: true });

        // must have camera timestamp
        const photoTime = metadata && (metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate);
        if (!photoTime) {
            return res.status(400).json({ status: 'fail', message: 'Photo metadata lacks a capture time; cannot verify live capture.' });
        }

        const now = new Date();
        const deltaMs = Math.abs(now - new Date(photoTime));
        const MAX_TIME_DIFF = 5 * 60 * 1000; // 5 minutes
        if (deltaMs > MAX_TIME_DIFF) {
            return res.status(400).json({ status: 'fail', message: 'Photo timestamp does not match current time (photo must be taken just now).' });
        }

        // require GPS coordinates in metadata
        if (typeof metadata.latitude !== 'number' || typeof metadata.longitude !== 'number') {
            return res.status(400).json({ status: 'fail', message: 'Photo must include GPS coordinates.' });
        }

        // ensure request includes a location to compare against
        if (!req.body.location || !Array.isArray(req.body.location.coordinates) || req.body.location.coordinates.length !== 2) {
            return res.status(400).json({ status: 'fail', message: 'Request body must include a location with coordinates [lon,lat].' });
        }

        const [reqLon, reqLat] = req.body.location.coordinates.map(Number);
        const photoLon = metadata.longitude;
        const photoLat = metadata.latitude;

        // simple haversine distance
        function distanceMeters(lat1, lon1, lat2, lon2) {
            const toRad = x => x * Math.PI / 180;
            const R = 6371000; // metres
            const φ1 = toRad(lat1);
            const φ2 = toRad(lat2);
            const Δφ = toRad(lat2 - lat1);
            const Δλ = toRad(lon2 - lon1);
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        const dist = distanceMeters(reqLat, reqLon, photoLat, photoLon);
        const MAX_DIST = 100; // 100m tolerance
        if (dist > MAX_DIST) {
            return res.status(400).json({ status: 'fail', message: `Photo location (${photoLat},${photoLon}) is more than ${MAX_DIST}m from reported location (${reqLat},${reqLon}).` });
        }

        // attach metadata for later storage/use
        req.exifMetadata = metadata;

        // save the file
        const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9\.\-_]/g, '_')}`;
        const destPath = path.join(UPLOAD_DIR, safeName);
        fs.writeFileSync(destPath, req.file.buffer);

        req.file.savedPath = destPath;
        req.file.relativePath = `uploads/${safeName}`;

        next();
    } catch (err) {
        console.error('EXIF parsing error', err);
        return res.status(400).json({ status: 'fail', message: 'Failed to parse EXIF data or invalid image.' });
    }
};
