import React from "react";
import { Link, NavLink } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import { withTranslation } from "react-i18next";

const SunIcon = () => (
  <svg className="ink-theme-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2"  x2="12" y2="5"  />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34"  />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2"  y1="12" x2="5"  y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg className="ink-theme-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

class Header extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      theme: localStorage.getItem("inkwell-theme") || "dark",
    };
  }

  componentDidMount() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
    this.props.onHeightChange(56);
  }

  toggleTheme = () => {
    const next = this.state.theme === "dark" ? "light" : "dark";
    this.setState({ theme: next });
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("inkwell-theme", next);
  };

  render() {
    const { isLoggedIn, userName } = this.context;
    const { t } = this.props;
    const { theme } = this.state;

    return (
      <header className="ink-header">
        <div className="ink-header-left">
          <Link to="/" className="ink-brand">Inkwell</Link>

          <button
            className="ink-theme-btn"
            onClick={this.toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ color: "var(--text-secondary)" }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="ink-header-right">
          {isLoggedIn && (
            <>
              <Link
                to={`/user/${encodeURIComponent(userName)}`}
                className="ink-username-display"
                style={{ textDecoration: "none" }}
              >
                {userName}
              </Link>
              <Link to="/new-post" as={NavLink} className="ink-new-post-link">
                + {t("newPost")}
              </Link>
              <button className="ink-logout-btn" onClick={() => this.context.logout()}>
                {t("logout")}
              </button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" as={NavLink} className="ink-login-link">{t("login")}</Link>
              <Link to="/register" as={NavLink} className="ink-register-btn">{t("register")}</Link>
            </>
          )}
        </div>
      </header>
    );
  }
}

export default withTranslation()(Header);
