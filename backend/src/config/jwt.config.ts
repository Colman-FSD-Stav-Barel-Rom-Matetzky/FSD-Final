export const JwtConfig = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
};
