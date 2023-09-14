sed -i 's@$CHAT_API_URL@'"$CHAT_API_URL"'@' /usr/src/fe/index.html
sed -i 's@$CHAT_WS_URL@'"$CHAT_WS_URL"'@' /usr/src/fe/index.html

nginx -g "daemon off;"