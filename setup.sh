#!/bin/bash

# VideoHub99 সার্ভার ইনস্টলেশন স্ক্রিপ্ট

echo "🎥 VideoHub99 সেটআপ শুরু করছি..."
echo ""

# প্যাকেজ ইনস্টল করুন
echo "📦 নোড প্যাকেজ ইনস্টল করছি..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ প্যাকেজ ইনস্টলেশন সফল!"
    echo ""
    echo "🚀 সার্ভার চালু করতে এই কমান্ড চালান:"
    echo ""
    echo "   npm start"
    echo ""
    echo "তারপর ব্রাউজারে যান: http://localhost:5000"
    echo ""
    echo "Admin লগইন করতে নাম: Jpro95"
    echo ""
else
    echo "❌ ইনস্টলেশন ব্যর্থ হয়েছে"
    exit 1
fi
