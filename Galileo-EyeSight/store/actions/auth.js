import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOGOUT = 'LOGOUT';
export const AUTHENTICATE = 'AUTHENTICATE';

let timer;

export const authenticate = (userId, token, expiryTime) =>{
    return dispatch => {
        dispatch(setLogOutTimer(expiryTime));
        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token
        });
    };
};

export const login = (email, password) => {
    return async dispatch => {
        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=google api key', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            }         
        );
        if (!response.ok) {
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!'
            if (errorId === 'EMAIL_NOT_FOUND') {
                message = 'This email could not be found!';
            } else if (errorId === 'INVALID_PASSWORD'){
                message = 'Password is not valid!';
            }
            throw new Error(message);
        };
        const resData = await response.json();
        dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn)*1000));
        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn)*1000);
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
    };
};

export const signup = (email, password) => {
    return async dispatch => {
        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBja9bg0WZoATdY8NPQUS5mtud9WEkQ9q8',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            }         
        );
        if (!response.ok) {
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!'
            if (errorId === 'EMAIL_EXISTS') {
                message = 'This email already exist!';
            }
            throw new Error(message);
        };
        const resData = await response.json();
        dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn)*1000));
        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn)*1000);
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
    };
};

export const logout = () => {
    clearLogoutTimer();
    AsyncStorage.removeItem('userData');
    return { type: LOGOUT };
};

const clearLogoutTimer = () => {
    if (timer) {
        clearTimeout(timer);
    }
};

const setLogOutTimer = expirationTime => {
    return dispatch => {
        timer = setTimeout(() => {
            dispatch(logout());
        }, expirationTime);
    }
};

const saveDataToStorage = (token, userId, expirationDate) => {
    AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expirationDate.toISOString()
    }));
};
