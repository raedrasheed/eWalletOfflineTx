package com.example.myapplication;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {

    private static final int REQUEST_ENABLE_BT = 0;
    private static final int REQUEST_DISCOVER_BT = 1;

    static final int STATE_LISTENING = 1;
    static final int STATE_CONNECTING = 2;
    static final int STATE_CONNECTED = 3;
    static final int STATE_CONNECTION_FAILED = 4;
    static final int STATE_MESSAGE_RECEIVED = 5;

    private boolean connected = false;

    TextView mStatusBluetoothTv, mStatusTv;
    ImageView mBluetoothIv;
    Button mOnBtn, mOffBtn, mDiscoverBtn, mPairedBtn, mSendBtn, mRecieveBtn;
    ListView mBTDevicesLv;

    BluetoothDevice[] btArray;

    SendReceive sendReceive;

    BluetoothAdapter mBluetoothAdapter;

    private static final String APP_NAME = "BOWallet";
    private static UUID MY_UUID = UUID.fromString("8ce255c0-223a-11e0-ac64-0803450c9a66");

    @SuppressLint("MissingPermission")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MY_UUID = UUID.fromString(id(this));
        setContentView(R.layout.activity_main);

        mStatusBluetoothTv = findViewById(R.id.statusBluetoothTv);
        mStatusTv = findViewById(R.id.statusTv);
        mBluetoothIv = findViewById(R.id.bluetoothIv);

        mOnBtn = findViewById(R.id.onBtn);
        mOffBtn = findViewById(R.id.offBtn);
        mDiscoverBtn = findViewById(R.id.discoverableBtn);
        mPairedBtn = findViewById(R.id.pairedBtn);
        mSendBtn = findViewById(R.id.sendBtn);
        mRecieveBtn = findViewById(R.id.RecieveBtn);

        mBTDevicesLv = findViewById(R.id.BTDevicesLv);

        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (mBluetoothAdapter == null) {
            mStatusBluetoothTv.setText("Bluetooth is not available");
        } else {
            mStatusBluetoothTv.setText("Bluetooth is available");
        }

        if (mBluetoothAdapter.isEnabled()) {
            mBluetoothIv.setImageResource(R.drawable.ic_connected);
        } else {
            mBluetoothIv.setImageResource(R.drawable.ic_disabled);
        }

        mOnBtn.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                if (!mBluetoothAdapter.isEnabled()) {
                    showToast("Turning on BT");
                    Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                    startActivityForResult(intent, REQUEST_ENABLE_BT);
                } else {
                    showToast("BT is already on");
                }

            }
        });

        mDiscoverBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!mBluetoothAdapter.isDiscovering()) {
                    showToast("Discovering..");
                    Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
                    startActivityForResult(intent, REQUEST_DISCOVER_BT);

                    ServerClass serverClass = new ServerClass();
                    serverClass.start();

                }
            }
        });

        mOffBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                    mBluetoothAdapter.disable();
                    showToast("Turning BT off ");
                    mBluetoothIv.setImageResource(R.drawable.ic_disabled);
            }
        });

        mPairedBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (mBluetoothAdapter.isEnabled()) {
                    //mStatusTv.setText("Listing Devices");
                    mStatusBluetoothTv.setText("Listing Devices");
                     Set<BluetoothDevice> BTDevices = mBluetoothAdapter.getBondedDevices();

                    String[] strings = new String[BTDevices.size()];
                    btArray = new BluetoothDevice[BTDevices.size()];
                    int index = 0;
                    if (BTDevices.size() > 0) {
                        for (BluetoothDevice device : BTDevices) {
                            btArray[index] = device;
                            strings[index] = device.getName();
                            index++;
                        }
                        ArrayAdapter<String> arrayAdapter = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_list_item_1, strings);
                        mBTDevicesLv.setAdapter(arrayAdapter);

                    }

                    /*for(BluetoothDevice device: BTDevices){
                        mPairedTv.append("\nDevice: " + device.getName()+", "+ BTDevices);
                    }*/
                }else {
                    showToast("Turn BT to pair devices..");
                }
            }
        });

        mSendBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!connected) {
                    mStatusBluetoothTv.setText("No device paired");
                }else {
                    mStatusBluetoothTv.setText("Sending..");
                }
            }
        });

        mRecieveBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!connected) {
                    mStatusBluetoothTv.setText("No device paired");
                }else {
                    mStatusBluetoothTv.setText("Receiving..");
                }
            }
        });

        mBTDevicesLv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                ClientClass clientClass = new ClientClass(btArray[i]);
                clientClass.start();

                //mStatusTv.setText("Connecting..");
                mStatusBluetoothTv.setText("Connecting..");
            }
        });

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        switch (requestCode){
            case REQUEST_ENABLE_BT:
                if(resultCode == RESULT_OK){
                    mBluetoothIv.setImageResource(R.drawable.ic_connected);
                    showToast("BT is on");
                }else {
                    showToast("Could not on BT");
                }
                break;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void showToast(String msg){
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    Handler handler = new Handler(new Handler.Callback() {
        @Override
        public boolean handleMessage(Message msg) {

            switch (msg.what) {
                case STATE_LISTENING:
                    //mStatusTv.setText("Listening");
                    mStatusBluetoothTv.setText("Listening");
                    break;
                case STATE_CONNECTING:
                    //mStatusTv.setText("Connecting");
                    mStatusBluetoothTv.setText("Connecting");
                    break;
                case STATE_CONNECTED:
                    //mStatusTv.setText("Connected");
                    mStatusBluetoothTv.setText("Connected");
                    break;
                case STATE_CONNECTION_FAILED:
                    //mStatusTv.setText("Connection Failed");
                    mStatusBluetoothTv.setText("Connection Failed");
                    break;
                case STATE_MESSAGE_RECEIVED:
                    byte[] readBuff = (byte[]) msg.obj;
                    String tempMsg = new String(readBuff, 0, msg.arg1);
                    //messages.add(tempMsg);
                    //blockchain.addBlock(blockchain.newBlock(tempMsg));
                    //msg_box.append("Other: " + tempMsg + "\n");
                    break;
            }
            return true;
        }
    });

    @SuppressLint("MissingPermission")
    private class ServerClass extends Thread {
        private BluetoothServerSocket serverSocket;

        public ServerClass() {
            try {
                serverSocket = mBluetoothAdapter.listenUsingRfcommWithServiceRecord(APP_NAME, MY_UUID);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        public void run() {
            BluetoothSocket socket = null;

            while (socket == null) {
                try {
                    Message message = Message.obtain();
                    message.what = STATE_CONNECTING;
                    handler.sendMessage(message);

                    socket = serverSocket.accept();
                } catch (IOException e) {
                    e.printStackTrace();
                    Message message = Message.obtain();
                    message.what = STATE_CONNECTION_FAILED;
                    handler.sendMessage(message);
                }

                if (socket != null) {
                    Message message = Message.obtain();
                    message.what = STATE_CONNECTED;
                    handler.sendMessage(message);

                    sendReceive = new SendReceive(socket);
                    sendReceive.start();

                    break;
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    private class ClientClass extends Thread {
        private BluetoothDevice device;
        private BluetoothSocket socket;

        public ClientClass(BluetoothDevice device1) {
            device = device1;

            try {
                socket = device.createRfcommSocketToServiceRecord(MY_UUID);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        public void run() {
            try {
                socket.connect();
                Message message=Message.obtain();
                message.what=STATE_CONNECTED;
                handler.sendMessage(message);

                sendReceive=new SendReceive(socket);
                sendReceive.start();

            } catch (IOException e) {
                e.printStackTrace();
                Message message=Message.obtain();
                message.what=STATE_CONNECTION_FAILED;
                handler.sendMessage(message);
            }
        }
    }

    private class SendReceive extends Thread{
        private final BluetoothSocket bluetoothSocket;
        private final InputStream inputStream;
        private final OutputStream outputStream;

        public SendReceive (BluetoothSocket socket)
        {
            bluetoothSocket=socket;
            InputStream tempIn=null;
            OutputStream tempOut=null;

            try {
                tempIn=bluetoothSocket.getInputStream();
                tempOut=bluetoothSocket.getOutputStream();
            } catch (IOException e) {
                e.printStackTrace();
            }

            inputStream=tempIn;
            outputStream=tempOut;
        }

        public void run()
        {
            byte[] buffer=new byte[1024];
            int bytes;

            while (true)
            {
                try {
                    bytes=inputStream.read(buffer);
                    handler.obtainMessage(STATE_MESSAGE_RECEIVED,bytes,-1,buffer).sendToTarget();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        public void write(byte[] bytes)
        {
            try {
                outputStream.write(bytes);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static String uniqueID = null;
    private static final String PREF_UNIQUE_ID = "PREF_UNIQUE_ID";

    @SuppressLint("ApplySharedPref")
    public synchronized static String id(Context context) {
        if (uniqueID == null) {
            SharedPreferences sharedPrefs = context.getSharedPreferences(
                    PREF_UNIQUE_ID, Context.MODE_PRIVATE);
            uniqueID = sharedPrefs.getString(PREF_UNIQUE_ID, null);
            if (uniqueID == null) {
                uniqueID = UUID.randomUUID().toString();
                SharedPreferences.Editor editor = sharedPrefs.edit();
                editor.putString(PREF_UNIQUE_ID, uniqueID);
                editor.commit();
            }
        }
        return uniqueID;
    }
}