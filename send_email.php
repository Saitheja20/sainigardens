<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(trim($_POST["bName"]));
    $phone = htmlspecialchars(trim($_POST["bPhone"]));
    $eventType = htmlspecialchars(trim($_POST["bEventType"]));
    $date = htmlspecialchars(trim($_POST["bDate"]));
    $message = htmlspecialchars(trim($_POST["bMessage"]));

    $to = "contact@sainigardens.com"; // Replace with the actual recipient email address
    $subject = "New Booking Enquiry from Saini Gardens";
    $headers = "From: webmaster@sainigardens.com\r\n"; // Replace with a valid sender email
    $headers .= "Reply-To: " . $to . "\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";

    $email_body = "
    <html>
    <body>
        <h2>New Booking Enquiry</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Phone:</strong> {$phone}</p>
        <p><strong>Event Type:</strong> {$eventType}</p>
        <p><strong>Selected Date:</strong> {$date}</p>
        <p><strong>Message:</strong><br/>{$message}</p>
    </body>
    </html>
    ";

    if (mail($to, $subject, $email_body, $headers)) {
        // Success: Redirect to a thank you page or show a success message
        header("Location: index.html?status=success");
        exit();
    } else {
        // Failure: Redirect to an error page or show an error message
        header("Location: index.html?status=error");
        exit();
    }
} else {
    // Not a POST request, redirect to homepage
    header("Location: index.html");
    exit();
}
?>