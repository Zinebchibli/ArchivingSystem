#### Workspace Environment for the Archiving Application :

## Description
Welcome to our archiving application! This application is designed to assist users in managing and organizing their archives efficiently .

## Technologies Used
- *Frontend Framework*: Angular
- *Backend Framework*: Express.js
- *Database*: MongoDB
- *Server Environment*: Ubuntu (Virtual Machine)
- *FTP Protocol*: Used for communication between the server and the web application.

## Server Configuration
### Network Configuration
- Local Machine IP: 192.168.10.2
- Virtual Machine (Ubuntu) Network Configuration:
  - IP Address: 192.168.10.1
  - Network Type: Host-Only

### FTP Server Setup (Ubuntu)
1. Update package list and install vsftpd:
  
   sudo apt update
   sudo apt install vsftpd
   

2. Configure firewall:
   
   sudo ufw allow 20/tcp
   sudo ufw allow 21/tcp
   sudo ufw allow 40000:50000/tcp
   sudo ufw enable
   

3. Create FTP user and directory:
   
   sudo adduser ftpuser
   sudo mkdir /home/ftpuser/ftp
   sudo chown nobody:nogroup /home/ftpuser/ftp
   sudo chmod a-w /home/ftpuser/ftp
   sudo mkdir /home/ftpuser/ftp/files
   sudo chown ftpuser:ftpuser /home/ftpuser/ftp/files
   

4. Configure vsftpd:
   sudo nano /etc/vsftpd.conf
   
   Add the following configuration:
  
   # /etc/vsftpd.conf
   listen=NO
   listen_ipv6=YES
   anonymous_enable=NO
   local_enable=YES
   write_enable=YES
   local_umask=022
   dirmessage_enable=YES
   use_localtime=YES
   xferlog_enable=YES
   connect_from_port_20=YES
   chroot_local_user=YES
   secure_chroot_dir=/var/run/vsftpd/empty
   pam_service_name=vsftpd
   force_dot_files=YES
   pasv_min_port=40000
   pasv_max_port=50000
   user_sub_token=$USER
   local_root=/home/$USER/ftp
   allow_writeable_chroot=YES
   

5. Restart vsftpd service:
  
   sudo systemctl restart vsftpd.service
   

## Frontend Setup
1. Install Node.js on the local machine.
2. Navigate to the frontend directory of the project in the terminal.
3. Install required packages:
   cd frontend/authapp
   npm install
   
4. Launch the frontend application:
   
   ng serve

   
## Backend Setup
1. Navigate to the backend directory of the project in a new terminal.
2. Execute the following command to start the backend server:
   
   node server.js
   
