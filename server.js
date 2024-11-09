const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
// Tin tưởng proxy nếu ứng dụng chạy sau một proxy
app.set('trust proxy', true);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Đường dẫn đến file dữ liệu
const dataFilePath = path.join(__dirname, 'data.json');

// Biến lưu trữ dữ liệu
let data = [];

// Hàm đọc dữ liệu từ file
async function loadData() {
    try {
        const fileData = await fs.readFile(dataFilePath, 'utf8');
        data = JSON.parse(fileData);
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu không phải là một mảng');
        }
        console.log('Dữ liệu đã được tải thành công');
    } catch (err) {
        console.error('Không thể đọc file dữ liệu:', err);
    }
}

// Tải dữ liệu khi khởi động server
loadData();

app.post('/test', (req, res) => {
    res.json({ message: 'POST request received successfully' });
});

// Endpoint để tìm kiếm cầu thủ
app.post('/search', (req, res) => {
    try {
        const { nameTerm, criteria } = req.body;

        if (!nameTerm && (!criteria || Object.keys(criteria).length === 0)) {
            return res.status(400).json({ error: 'Cần cung cấp ít nhất một tiêu chí tìm kiếm' });
        }

        const results = data.filter(player => {
            const nameMatch = !nameTerm ||
                player.first_name.toLowerCase().includes(nameTerm.toLowerCase()) ||
                player.last_name.toLowerCase().includes(nameTerm.toLowerCase());

            const criteriaMatch = !criteria || Object.keys(criteria).every(key => {
                return !criteria[key] || String(player[key]).toLowerCase().includes(criteria[key].toLowerCase());
            });

            return nameMatch && criteriaMatch;
        });

        res.json(results);
    } catch (error) {
        console.error('Lỗi trong quá trình tìm kiếm:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý yêu cầu' });
    }
});

// Xử lý lỗi cho các route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({ error: 'Không tìm thấy endpoint' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Đã xảy ra lỗi server' });
});

app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
});