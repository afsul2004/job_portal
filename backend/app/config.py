import os

class Settings:
    PROJECT_NAME: str = "Job Portal Based on Online Examination System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # MySQL connection configuration (supports standard DB_* and Railway's MYSQL* variables)
    DB_HOST: str = os.getenv("MYSQLHOST") or os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("MYSQLPORT") or os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("MYSQLUSER") or os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD", "root")
    DB_NAME: str = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME", "job_portal_exam")

    # Railway MySQL Cloud Database URI
    CLOUD_DB_URI: str = "mysql+pymysql://root:rBocBPvjvxndEFQpFmlHRYGhIXoJwAoZ@maglev.proxy.rlwy.net:46607/railway?charset=utf8mb4"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        database_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")
        if database_url:
            if database_url.startswith("mysql://"):
                return database_url.replace("mysql://", "mysql+pymysql://", 1)
            return database_url

        # If individual MySQL/DB env vars exist (e.g. from Railway MySQL plugin)
        mysql_host = os.getenv("MYSQLHOST") or os.getenv("DB_HOST")
        if mysql_host and mysql_host != "localhost":
            user = os.getenv("MYSQLUSER") or os.getenv("DB_USER", "root")
            pw = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD", "")
            port = os.getenv("MYSQLPORT") or os.getenv("DB_PORT", "3306")
            db_name = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME", "railway")
            return f"mysql+pymysql://{user}:{pw}@{mysql_host}:{port}/{db_name}?charset=utf8mb4"

        # When running in Railway production environment (PORT is set)
        if os.getenv("PORT") or os.getenv("RAILWAY_ENVIRONMENT"):
            return self.CLOUD_DB_URI

        # Default local development fallback
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    # JWT Authentication configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Uploads
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", "resumes"))

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
