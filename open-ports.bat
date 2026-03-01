@echo off
echo Opening ports for MAI Chat application...
echo.

echo Opening Vite port 5173...
netsh advfirewall firewall add rule name="MAI Chat Vite" dir=in action=allow protocol=tcp localport=5173

echo Opening Backend port 3001...
netsh advfirewall firewall add rule name="MAI Chat Backend" dir=in action=allow protocol=tcp localport=3001

echo.
echo Ports opened successfully!
echo Now you can access from other devices using: http://192.168.56.1:5173
echo.
pause
