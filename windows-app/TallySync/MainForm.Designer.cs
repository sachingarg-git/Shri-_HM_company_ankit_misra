namespace TallySync
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;
        private Button btnConnect;
        private Button btnSyncData;
        private Label lblStatus;
        private ListBox listCompanies;
        private Label lblTitle;
        private GroupBox groupConnection;
        private GroupBox groupData;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.btnConnect = new Button();
            this.btnSyncData = new Button();
            this.lblStatus = new Label();
            this.listCompanies = new ListBox();
            this.lblTitle = new Label();
            this.groupConnection = new GroupBox();
            this.groupData = new GroupBox();
            this.SuspendLayout();

            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new Font("Microsoft Sans Serif", 14F, FontStyle.Bold);
            this.lblTitle.Location = new Point(20, 20);
            this.lblTitle.Name = "lblTitle";
            this.lblTitle.Size = new Size(250, 24);
            this.lblTitle.Text = "Tally Sync Desktop App";

            // groupConnection
            this.groupConnection.Controls.Add(this.btnConnect);
            this.groupConnection.Controls.Add(this.lblStatus);
            this.groupConnection.Location = new Point(20, 60);
            this.groupConnection.Name = "groupConnection";
            this.groupConnection.Size = new Size(460, 100);
            this.groupConnection.Text = "Connection";

            // btnConnect
            this.btnConnect.Location = new Point(20, 30);
            this.btnConnect.Name = "btnConnect";
            this.btnConnect.Size = new Size(120, 30);
            this.btnConnect.Text = "Connect to Backend";
            this.btnConnect.UseVisualStyleBackColor = true;
            this.btnConnect.Click += new EventHandler(this.btnConnect_Click);

            // lblStatus
            this.lblStatus.AutoSize = true;
            this.lblStatus.Location = new Point(160, 37);
            this.lblStatus.Name = "lblStatus";
            this.lblStatus.Size = new Size(120, 15);
            this.lblStatus.Text = "Ready to connect...";

            // groupData
            this.groupData.Controls.Add(this.btnSyncData);
            this.groupData.Controls.Add(this.listCompanies);
            this.groupData.Location = new Point(20, 180);
            this.groupData.Name = "groupData";
            this.groupData.Size = new Size(460, 250);
            this.groupData.Text = "Tally Data Management";

            // btnSyncData
            this.btnSyncData.Enabled = false;
            this.btnSyncData.Location = new Point(20, 30);
            this.btnSyncData.Name = "btnSyncData";
            this.btnSyncData.Size = new Size(120, 30);
            this.btnSyncData.Text = "Sync Sample Data";
            this.btnSyncData.UseVisualStyleBackColor = true;
            this.btnSyncData.Click += new EventHandler(this.btnSyncData_Click);

            // listCompanies
            this.listCompanies.FormattingEnabled = true;
            this.listCompanies.ItemHeight = 15;
            this.listCompanies.Location = new Point(20, 80);
            this.listCompanies.Name = "listCompanies";
            this.listCompanies.Size = new Size(420, 150);

            // MainForm
            this.AutoScaleDimensions = new SizeF(7F, 15F);
            this.AutoScaleMode = AutoScaleMode.Font;
            this.ClientSize = new Size(520, 460);
            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.groupConnection);
            this.Controls.Add(this.groupData);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.Name = "MainForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "Tally Sync - Desktop Application";
            this.FormClosing += new FormClosingEventHandler(this.MainForm_FormClosing);
            this.ResumeLayout(false);
            this.PerformLayout();
        }
    }
}