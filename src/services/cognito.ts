import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '';

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
  Storage: AsyncStorage,
});

export type AuthUser = {
  cognitoId: string;
  email: string;
  idToken: string;
};

export const signUp = (email: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];
    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const confirmSignUp = (email: string, code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const signIn = (email: string, password: string): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const idToken = session.getIdToken();
        resolve({
          cognitoId: idToken.payload.sub,
          email: idToken.payload.email,
          idToken: idToken.getJwtToken(),
        });
      },
      onFailure: reject,
    });
  });
};

export const signOut = (): void => {
  const user = userPool.getCurrentUser();
  user?.signOut();
};

export const getCurrentSession = (): Promise<AuthUser | null> => {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) return resolve(null);
      const idToken = session.getIdToken();
      resolve({
        cognitoId: idToken.payload.sub,
        email: idToken.payload.email,
        idToken: idToken.getJwtToken(),
      });
    });
  });
};
