import { useState } from "react";

function Contact() {

  const [message, setMessage] = useState("");

  return (
    <div>

      <h1>Contact Me</h1>

      <input
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <h3>Your Message:</h3>

      <p>{message}</p>

    </div>
  );
}

export default Contact;