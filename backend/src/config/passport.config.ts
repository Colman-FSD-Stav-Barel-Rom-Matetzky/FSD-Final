import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { User } from '../models/user.model';
import { GoogleConfig } from './google.config';

passport.use(
  new GoogleStrategy(
    {
      clientID: GoogleConfig.clientId || '',
      clientSecret: GoogleConfig.clientSecret || '',
      callbackURL: GoogleConfig.callbackUrl || '',
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      void (async () => {
        try {
          const email = profile.emails?.[0].value;

          if (!email) {
            return done(new Error('No email found from Google profile'), false);
          }

          let user = await User.findOne({ email });

          if (!user) {
            const username = profile.displayName || email.split('@')[0];
            user = await User.create({
              email,
              username,
              profileImage: profile.photos?.[0].value,
              isGoogleUser: true,
            });
          }

          return done(null, user as Express.User);
        } catch (error) {
          return done(error as Error, false);
        }
      })();
    },
  ),
);

export { passport as configuredPassport };
