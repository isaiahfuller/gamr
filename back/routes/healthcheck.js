const express = require('express');
const router = express.Router();

router.get('/api/status', (res) => {
    res.json({ message: 'API is UP', status: 200});
});

module.exports = router;