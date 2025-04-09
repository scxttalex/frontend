"use client"

import React, { useState } from 'react';
import { Typography, Form, Input, Button, TimePicker, Flex, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const Area: React.FC = () => {
  const [form] = Form.useForm();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleImageUpload = async (fileList: any[]) => {
    const uploadedUrls: string[] = [];
    try {
        // Retrieve user data from localStorage
      const user = localStorage.getItem("user"); // Get user data from localStorage

      if (!user) {
        toast.error("User data not found in localStorage.");
        return;
      }

      // Parse the user data
      const parsedUser = JSON.parse(user);

      // Extract token from parsed user data
      const token = parsedUser.token;
      for (let i = 0; i < fileList.length; i++) {
        const formData = new FormData();
        formData.append('file', fileList[i]);
  
        // Your backend's image upload API endpoint
        const uploadUrl = 'http://localhost:8080/s3/upload'; 
  
        // Upload each image one by one
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Assuming the response contains the URL of the uploaded image
        if (response.status === 200 && response.data) {
          uploadedUrls.push(response.data); // Save the uploaded image URL
        } else {
          throw new Error('Image upload failed');
        }
      }
      
      // Use the functional form of setImageUrls to accumulate the URLs
      setImageUrls((prevUrls) => [...prevUrls, ...uploadedUrls]);
  
      message.success('Images uploaded successfully');
    } catch (error) {
      message.error('Error uploading images');
      console.error(error);
    }
  };
  

  const handleFormSubmit = async (values: any) => {
    // Include the image URLs in the form data
    const formattedValues = {
        areaName: values.name,
        openTime: values.openTime ? dayjs(values.openTime).format('HH:mm') : undefined,
        closeTime: values.closeTime ? dayjs(values.closeTime).format('HH:mm') : undefined,
        guestCapacity: values.guestCapacity,
        basePrice: values.basePrice,
        areaDescription: values.description,

        areaImages: imageUrls,
    };
  
    // // For now, just log the form data to the console
    // console.log('Form Data:', formattedValues);
  
    // Normally, here you would send it to the backend:
    try {
      const response = await axios.post('http://localhost:8080/areas', formattedValues);
      if (response.status === 200) {
        message.success('Area created successfully');
      } else {
        message.error('Error creating area');
      }
    } catch (error) {
      message.error('Error submitting form');
      console.error(error);
    }
  };
  

  return (
    <div>
      <Typography.Title level={4}>Create a new Area</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: '100%', marginRight: 30 }}
        onFinish={handleFormSubmit}
      >
        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>

        <Flex justify="space-between" gap={10}>
          <Form.Item label="Opening Time" name="openTime">
            <TimePicker
              hideDisabledOptions
              placeholder="Open time"
              format="HH:mm"
              minuteStep={15}
              disabledTime={() => ({ disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7] })}
            />
          </Form.Item>

          <Form.Item label="Closing Time" name="closeTime">
            <TimePicker
              placeholder="Close time"
              hideDisabledOptions
              format="HH:mm"
              minuteStep={15}
              disabledTime={() => ({ disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7] })}
            />
          </Form.Item>

          <Form.Item label="Guest Capacity" name="guestCapacity">
            <Input />
          </Form.Item>

          <Form.Item label="Price" name="basePrice">
            <Input />
          </Form.Item>
        </Flex>

        <Form.Item label="Description" name="description">
          <Input.TextArea style={{ height: 120, resize: 'none' }} showCount maxLength={300} />
        </Form.Item>

        <Form.Item>
          <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
            <Upload.Dragger
              name="files"
              beforeUpload={(file) => {
                handleImageUpload([file]); // Upload each file sequentially
                return false; // Prevent automatic upload
              }}
              fileList={[]}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for a single or bulk upload.</p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form>
    </div>
  );
};

export default Area;
