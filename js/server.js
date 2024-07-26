const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Kết nối tới MongoDB
const dbURI = "mongodb+srv://huudung038:1@clusterhuudung.z5tdrft.mongodb.net/myDataTimeLine?retryWrites=true&w=majority&appName=ClusterHuuDung";

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose đã kết nối tới MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Lỗi kết nối Mongoose: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose đã ngắt kết nối');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Định nghĩa schema cho bộ sưu tập
const hubDataSchema = new mongoose.Schema({
  no: String,
  task: String,
  time: Number,
  details: [
    {
      time: Number,
      desc: String,
      class: String
    }
  ]
});

// Tạo model từ schema
const HubData = mongoose.model('HubData', hubDataSchema);

// Route để nhận dữ liệu từ client và lưu vào MongoDB
app.post('/api/data', async (req, res) => {
  try {
    const dataObject = req.body;

    // Chuyển đổi đối tượng thành mảng
    const dataArray = Object.values(dataObject);

    console.log(dataArray);

    if (dataArray.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu rỗng' });
    }

    console.log('Data to insert:', dataArray);

    const result = await HubData.insertMany(dataArray);
    res.status(200).json({ message: 'Dữ liệu đã được chèn thành công', result });
  } catch (error) {
    console.error('Error inserting data: ', error);
    res.status(500).json({ message: 'Lỗi khi chèn dữ liệu', error });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
