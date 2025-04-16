"use client"

import { useState, useEffect } from 'react';
import { Input, Button, Form, Select } from 'antd';

const EditUserForm = ({ initialData, onSubmit }) => {
    const [form] = Form.useForm();
    
    // set the form initial values with the passed data
    useEffect(() => {
        form.setFieldsValue({
            id: initialData.id,
            firstName: initialData.details.firstName,
            surname: initialData.details.surname,
            mobileNumber: initialData.details.mobileNumber,
            email: initialData.details.email,
            dateOfBirth: initialData.details.dateOfBirth,
            username: initialData.username,
            password: initialData.password,
            permissions: initialData.permissions,
            isGuest: initialData.isGuest,
        });
    }, [form, initialData]);

    const handleSubmit = (values) => {
        onSubmit(values); // Send the form data back to parent for submission
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="id" label="ID" hidden>
                <Input />
            </Form.Item>

            <Form.Item name={['details', 'firstName']} label="First Name" rules={[{ required: true, message: 'Please input first name!' }]}>
                <Input />
            </Form.Item>

            <Form.Item name={['details', 'surname']} label="Surname" rules={[{ required: true, message: 'Please input surname!' }]}>
                <Input />
            </Form.Item>

            <Form.Item name={['details', 'mobileNumber']} label="Mobile Number" rules={[{ required: true, message: 'Please input mobile number!' }]}>
                <Input />
            </Form.Item>

            <Form.Item name={['details', 'email']} label="Email" rules={[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                <Input />
            </Form.Item>

            <Form.Item name={['details', 'dateOfBirth']} label="Date of Birth" rules={[{ required: true, message: 'Please input date of birth!' }]}>
                <Input type="date" />
            </Form.Item>

            <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input username!' }]}>
                <Input />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input password!' }]}>
                <Input.Password />
            </Form.Item>

            <Form.Item name="permissions" label="Permissions">
                <Select mode="tags" style={{ width: '100%' }}>
                    <Select.Option value="user">User</Select.Option>
                    <Select.Option value="admin">Admin</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item name="isGuest" label="Is Guest" valuePropName="checked">
                <Input type="checkbox" />
            </Form.Item>

            <Button type="primary" htmlType="submit">Save</Button>
        </Form>
    );
};

export default EditUserForm;
