<?php
// Nhận dữ liệu từ form
$jsonD = $_POST['data'];

// Giải mã JSON
$data = json_decode($jsonD, true);

// Kiểm tra lỗi giải mã
if (json_last_error() !== JSON_ERROR_NONE) {
    echo 'Lỗi giải mã JSON: ' . json_last_error_msg();
    exit;
}

// Sử dụng dữ liệu
// var_dump($data); // In ra để kiểm tra


function transformData($data) {
    $tasks = [];
    $taskIndex = 0;
    $detailIndex = 0;

    foreach ($data as $item) {
        if (count($item) === 1) {
            // Đây là số nhiệm vụ
            $taskIndex++;
            $detailIndex = 0;
            $tasks[$taskIndex] = [
                'no' => $item[0],
                'task' => '',
                'time' => 0,
                'details' => [],
            ];
            continue; // Bỏ qua vòng lặp hiện tại và tiếp tục với item tiếp theo
        }

        // Đây là nhiệm vụ hoặc chi tiết
        if (count($item) >= 5) {
            list($code, $taskName, $desc, , $time) = $item;

            if ($taskName) {
                // Đây là nhiệm vụ
                $tasks[$taskIndex]['task'] = $taskName;
                $tasks[$taskIndex]['time'] += (float)$time;
                continue; // Bỏ qua vòng lặp hiện tại và tiếp tục với item tiếp theo
            }

            // Đây là chi tiết
            $tasks[$taskIndex]['details'][$detailIndex] = [
                'time' => (float)$time,
                'desc' => $desc,
                'class' => 'detail-' . $detailIndex,
            ];
            $detailIndex++;
        }
    }

    return $tasks;
}



$tasks = transformData($data);

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="/traingoogleapi/css/style.css">
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
        .random-color {
            background-color: #<?php echo substr(md5(rand()), 0, 6); ?>
        }
        td.empty {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <table class="timeline">
        <thead>
            <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Task</th>
                <th rowspan="2">Estimated time (hours)</th>
                <th colspan="7">Day</th>
            </tr>
            <tr>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
            </tr>
        </thead>
        <tbody>
            <?php
               $total_time = 0;
               $tmp_time = 0;
            ?>
            <?php foreach ($tasks as $task): ?>
                <?php foreach ($task['details'] as $index => $detail): ?>
                    <?php
                        $total_time += $detail['time'];
                        $td_number = $total_time / 8;

                        $tmp_time += $detail['time'];
                        $colspan = ceil($tmp_time / 8);
                        if ($colspan > 1) {
                            $colspan = 2;
                            $td_number =  $td_number - 1;
                            $tmp_time =  fmod($tmp_time, 8);
                        }
                    ?>

                    <tr>
                        <?php if ($index === 0): ?>
                            <td rowspan="<?= count($task['details']) ?>"><?= $task['no'] ?></td>
                            <td rowspan="<?= count($task['details']) ?>"><?= $task['task'] ?></td>
                            <td rowspan="<?= count($task['details']) ?>"><?= $task['time'] ?></td>
                        <?php endif; ?>

                        <!-- Hiển thị thời gian chi tiết -->
                        <td><?= $detail['time'] ?></td>

                        <!-- Các ô trống -->
                        <?php for ($i = 1; $i < $td_number; $i++): ?>
                            <td class="empty"></td>
                        <?php endfor; ?>

                        <!-- Ô dữ liệu -->
                        <td style="background-color: #<?php echo substr(md5(rand()), 0, 6); ?>" class="<?= $detail['class'] ?>" colspan="<?php echo $colspan; ?>">
                            <?= $detail['desc'] ?>
                        </td>
                        
                    </tr>

                <?php endforeach; ?>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>