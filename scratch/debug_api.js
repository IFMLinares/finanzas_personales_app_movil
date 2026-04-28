import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

async function test() {
    try {
        // En un entorno real necesitaríamos token, pero veamos si al menos llega al 401 o 404
        const response = await api.get('/automation/templates/');
        console.log('Response Structure:', Object.keys(response.data));
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('Error status:', error.response.status);
            console.log('Error data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

test();
