//import request from '../utils/request';
import axios from 'axios';

//TODO 注意与后端对接

/*
export const fetchData = query => {
    return request({
        url: './table.json',
        method: 'get',
        params: query
    });
};
*/


export const getQuery = axios.create({
})

export const fetchData = query => {
    return getQuery({
        url: './table.json',
        method: 'get',
        params: query
    });
};