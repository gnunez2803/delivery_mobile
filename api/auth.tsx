import backendClient from './config';

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
}

const Login = async(data: LoginRequest): Promise<LoginResponse> => {
    backendClient.getInstance(process.env.BACKEND_API_ENDPOINT);
    try {
        
        const response = await backendClient.post<any, {email:string }>('/login', requestBody);
        const token = response.data.token;
        return { token };
    } catch (error) {
        console.error(error)
        console.error('Login error: ', error);
        throw new Error("Unable to login");
    }
};

export default Login;