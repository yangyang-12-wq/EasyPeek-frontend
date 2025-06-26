import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      className={`theme-toggle ${theme}`}
      size="large"
      title={theme === 'light' ? '切换到黑夜模式' : '切换到白天模式'}
    >
      {theme === 'light' ? '' : ''}
    </Button>
  );
};

export default ThemeToggle;