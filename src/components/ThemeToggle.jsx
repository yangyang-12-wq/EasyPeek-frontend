import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // 只在页面顶部200px范围内显示
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop < 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      type="text"
      icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      className={`theme-toggle ${theme} ${className}`}
      style={style}
      title={theme === 'light' ? '切换到黑夜模式' : '切换到白天模式'}
    />
  );
};

export default ThemeToggle;