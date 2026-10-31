function ErrorMessage({ message }) {
  return (
    <div style={{ textAlign: "center", color: "red" }}>
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;