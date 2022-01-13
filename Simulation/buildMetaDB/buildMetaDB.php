<?php
include("mycdn.php");
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS car";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully";
} else {
    echo "Error creating database: " . $conn->error;
}

// sql to create table
$sql = "CREATE TABLE IF NOT EXISTS dc (
    op16 smallint(5) unsigned DEFAULT '0'
    cla16 smallint(5) unsigned DEFAULT '0',
    clb16 smallint(5) unsigned DEFAULT '0',
    tick16 smallint(5) unsigned DEFAULT '0',
    cab64 bigint(20) unsigned DEFAULT '0',
    ref64 bigint(20) unsigned DEFAULT '0',
    id64 bigint(20) unsigned DEFAULT '0',
    stamp64 bigint(20) unsigned DEFAULT '0',
    cab32 int(10) unsigned DEFAULT '0',
    ref32 int(10) unsigned DEFAULT '0',
    id32 int(10) unsigned DEFAULT '0',
    tick32 int(10) unsigned DEFAULT '0',
    etick32 int(10) unsigned DEFAULT '0',
    str256 varchar(256) COLLATE latin1_bin NOT NULL DEFAULT '',
    jstr60k varchar(61440) COLLATE latin1_bin NOT NULL DEFAULT ''
)";

mysqli_select_db($conn, 'car');

if ($conn->query($sql) === TRUE) {
    echo "Table MyGuests created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}



for ($x = 0; $x < 1; $x++) { //sizeof($categories)
    $op16 = '';
    $cla16 = '';
    $clb16 = '';
    $tick16 = '';
    $cab64 = '';
    $ref64 = '';
    $id64 = '';
    $stamp64 = '';
    $cab32 = '';
    $ref32 = '';
    $id32 = '';
    $tick32 = '';
    $etick32 = '';
    $str256 = '';
    $jstr60k = '';

    $sql = "INSERT INTO dc (op16, cla16, clb16, tick16, cab64, ref64, id64, stamp64, cab32, ref32, id32, tick32, etick32, str256, jstr60k) VALUES 
            (50, 'gdfgsdf')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

$conn->close();
?>
