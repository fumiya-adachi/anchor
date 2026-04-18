export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Chat: {
    conversationId: string;
    name: string;
    verified: boolean;
    photoKey: string; // key into userPhotos (e.g. 'u001')
  };
};
