function Header({ name, themeColor }) {
  return (
    <header style={{ backgroundColor: themeColor }}>
      <h1>Student Portfolio</h1>
      <h2>{name}</h2>
    </header>
  );
}

export default Header;