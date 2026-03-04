import http from '@/services/axios';

export const getHello = () => http.get('/hello/');
