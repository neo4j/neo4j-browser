import { Folder, cleanFoldersFromStorage, initialState } from './foldersDuck'

const basicFolder: Folder = { name: 'Couriway', id: 'identity' }
describe('loads from localstorage', () => {
  it('handles missing stored data', () => {
    expect(cleanFoldersFromStorage(undefined)).toEqual(initialState)
    expect(cleanFoldersFromStorage(undefined as any)).toEqual(initialState)
  })
  it('handles non list stored data types', () => {
    expect(cleanFoldersFromStorage({ tes: 23 } as any)).toEqual(initialState)
    expect(cleanFoldersFromStorage('fol' as any)).toEqual(initialState)
  })
  it('handles proper stored user data', () => {
    expect(cleanFoldersFromStorage([])).toEqual(initialState)
    expect(cleanFoldersFromStorage([basicFolder])).toEqual(
      initialState.concat([basicFolder])
    )
  })
  it('drops static folders', () => {
    expect(
      cleanFoldersFromStorage([
        ...initialState,
        ...initialState,
        { ...basicFolder, isStatic: true },
        basicFolder
      ])
    ).toEqual([...initialState, basicFolder])
  })
  it('handles real data from storage', () => {
    expect(cleanFoldersFromStorage(realLifeFolders, realLifeFavs)).toEqual([
      { id: '177b0687-5ded-458f-b07c-47ab1de83f09', name: 'BOM_ModelingClass' },
      { id: 'abccf0dc-f510-431e-83eb-176b78188b8b', name: 'Play_DataScience' },
      { id: 'c0fb8901-54fe-4365-b715-52d7073c7be9', name: 'ExampleProject' },
      { id: '0f14bd4b-5d36-4197-a967-05e0dfa6a32a', name: 'Test_Playbook' },
      { id: '5aecb8c0-ee59-4416-9224-fc37e4f5f231', name: 'Northwind' },
      { id: '1746146a-dbf7-486d-9c30-f6930c2a01d9', name: 'Airport_devworks' },
      { id: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851', name: 'Airport_Class' },
      { id: 'c59ffbf9-51d8-4769-b02b-39d245c00afd', name: 'Dates' },
      { id: '1050b419-a475-47d6-bd2b-8de8f0af0e86', name: 'Json' },
      { id: '9306c44e-b3c2-4304-bcfb-c4e0e4717866', name: 'apoc_load_csv' },
      { id: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02', name: 'PLAY GUIDES' },
      {
        id: '99d72f29-5bbf-40fa-b227-b67c094bcd88',
        name: 'A_gdsclass_testing'
      },
      { id: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c', name: 'A_GDS_Retail_Demo' },
      { id: 'b6d68ee8-a6a6-4197-bfb3-7c6d06e65a5e', name: 'Data Validation' },

      { id: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a', name: 'LinkedList' },
      { id: 'ae093102-8bc4-4e1d-aa8e-36d69db25556', name: 'Cardinal' },
      { id: '0ddeacad-a62e-42c7-a6d0-50cbea93b468', name: 'JDBC_mysql' },
      { id: '20315ade-508b-4491-a019-16fda725c88d', name: 'CSV_apoc' },
      { id: 'f4a62305-d9d7-4933-8d25-4f33e2065ecc', name: 'fincen' },
      { id: '71b64b96-5f5d-406f-bce5-b356e4fb7a2b', name: 'DataSciencePlay' },
      { id: '36164ba5-6401-4c64-82af-d3b30de639cc', name: 'Play Guides' },
      { id: 'cfdfeb37-b8d2-481d-ab16-7587dac083f6', name: 'All Play Guides' },
      { id: 'a0be4ad0-01d6-46ed-b05c-0cee6033ad55', name: 'JDBC' },
      {
        id: 'dff24df8-be80-48d4-912a-0a84e92b1aa3',
        name: 'A_GDSCLASS_testing'
      },
      { id: '909bbdb4-e472-4d28-8fc5-326adf67585d', name: 'CSV' },
      { id: 'b1411242-c053-41c8-9adc-c71bb871cf05', name: 'New Folder' }
    ])
  })
})
const realLifeFolders = [
  { id: 'basics', name: 'Basic Queries', isStatic: true, versionRange: '' },
  { id: 'graphs', name: 'Example Graphs', isStatic: true, versionRange: '' },
  { id: 'profile', name: 'Data Profiling', isStatic: true, versionRange: '' },
  {
    id: 'procedures',
    name: 'Common Procedures',
    isStatic: true,
    versionRange: ''
  },
  { id: '4947459c-2f62-4df4-b520-91cda0f9bd43', name: 'Play' },
  { id: '1bbb219d-f432-4ade-bece-febdae3a0149', name: 'Play' },
  { id: '6b54b8c0-f19f-4478-a2ee-839a3392906b', name: 'Play' },
  { id: '18fe9807-c4da-43f9-a798-19c24600a233', name: 'Play' },
  { id: '5e04e221-5740-4251-98fe-cc1762c74783', name: 'Play' },
  { id: '3bb9c37d-85a9-453d-9b76-6cd2e13c2b3e', name: 'Play' },
  { id: '687d50bb-e706-47bd-b3c4-a605cf1de029', name: 'Play' },
  { id: '8aeac859-9492-4a5a-9bbc-a10f7885e50e', name: 'Play' },
  { id: 'b64cbd26-10e5-4827-8624-fff2a63d3586', name: 'AdvancedCypher' },
  { id: '21d71bb6-8f6e-4910-9d42-a483999d4aa9', name: 'BOM_Max' },
  { id: '8e8f604a-f7f8-4233-bf2e-e5d750d31c5c', name: 'BOM_Max' },
  { id: 'ae033840-51e5-400f-8f5d-23d494a804fa', name: 'BOM_Max' },
  { id: 'd5104786-dcba-492a-b54f-f1efe5da8fbd', name: 'BOM_Max' },
  { id: '21716228-3f62-451a-b421-8cb5a7b44fcf', name: 'BOM_Max_2' },
  { id: '87ffa549-bc9d-451a-94d8-886ddfe22c53', name: 'BOM_Max_1' },
  { id: 'eac8a7d6-13f5-491c-8873-d6cdb7c2edbf', name: 'BOM_Max_1' },
  { id: 'f37db12e-1656-4280-94ce-4a01a8524628', name: 'BOM_Max_1' },
  { id: 'b27ba085-adc2-4af2-93d7-2c846ea58ec3', name: 'BOM_Max_1' },
  { id: '16d979b8-080b-4f34-a9cf-ac6b366b0535', name: 'BOM_Max_1' },
  { id: 'f1d12927-a43c-4e8f-b65c-7c5eb1af3bed', name: 'BOM_Max_1' },
  { id: '28d024f8-a52b-4795-a23f-e50bc34b81ee', name: 'BOM_Max_1' },
  { id: '228a2baa-325a-4018-a488-5ebf0ba6ff0d', name: 'BOM_Max_1' },
  { id: '177b0687-5ded-458f-b07c-47ab1de83f09', name: 'BOM_ModelingClass' },
  { id: 'da2132d1-7c50-4ae5-926c-b8fb1323a726', name: 'BOM_ModelingClass' },
  { id: '20e73106-8ac6-4583-82af-f5ab873ee57e', name: 'BOM_ModelingClass' },
  { id: 'cb57ab62-4a16-4181-a9b8-b63648c8d8a5', name: 'BOM_ModelingClass' },
  { id: 'dc1e871f-ea97-43fe-b269-86ba1921202e', name: 'BOM_ModelingClass' },
  { id: '9e64a755-66b7-434c-a590-eab9e289037d', name: 'BOM_ModelingClass' },
  { id: '849a9be5-05a9-4c17-adee-f4b4f703b41d', name: 'BOM_ModelingClass' },
  { id: '71b64b96-5f5d-406f-bce5-b356e4fb7a2b', name: 'DataSciencePlay' },
  { id: 'abccf0dc-f510-431e-83eb-176b78188b8b', name: 'Play_DataScience' },
  { id: 'ad31f68b-bf4f-4ff6-ba1c-011eb6e6d438', name: 'Play_DataScience' },
  { id: '9920b370-b3a8-4710-93ba-82604632dfa4', name: 'Play_DataScience' },
  { id: 'efdd9d39-3488-45cc-b54e-3bcc62e8e834', name: 'Play_DataScience' },
  { id: '4e769138-720f-47db-ad1b-5f383040a938', name: 'Play_DataScience' },
  { id: '8be4da1d-21c0-4be8-b05c-5097f1401f75', name: 'Play_DataScience' },
  { id: '312f5dc3-9355-46dc-9988-ab22b33e602f', name: 'Play_DataScience' },
  { id: '2a7f1254-fb43-4628-9f76-9ee6cd656bf1', name: 'Play_DataScience' },
  { id: '6401955a-a320-4d31-9c54-64601d048f67', name: 'Play_DataScience' },
  { id: 'b4e8656f-aa09-4fc2-9d57-93ea91dc346f', name: 'Play_DataScience' },
  { id: 'bf233e0e-5d67-49a1-840e-92c5f60c2166', name: 'Play_DataScience' },
  { id: '25fb8e8a-faef-49a3-a924-be677bf58ee9', name: 'Play_DataScience' },
  { id: 'df8eee99-691a-4854-b131-fef1b06549e2', name: 'Play_DataScience' },
  { id: 'cd2511e4-e01f-4a63-b201-fcfeec81e75e', name: 'Play_DataScience' },
  { id: 'f74ae432-fd60-4212-8caf-59e43f654f55', name: 'Play_DataScience' },
  { id: 'b27ab37b-d2b5-454d-9709-b64a9963f68f', name: 'Play_DataScience' },
  { id: '449ff6e9-44bf-42bb-961e-51ec7139938e', name: 'Play_DataScience' },
  { id: 'f6dca826-876a-4122-ad24-93828e91a2d9', name: 'Play_DataScience' },
  { id: '9d90257a-a206-4363-88d8-e8749e87d6d5', name: 'Play_DataScience' },
  { id: 'f46451a3-b017-4305-8887-571e15fdce9d', name: 'Play_DataScience' },
  { id: '9eb6af67-0217-45d5-942b-47c91dc94fed', name: 'Play_DataScience' },
  { id: 'ddd16bab-5b0f-42aa-a0a9-f2014dfb26ce', name: 'Play_DataScience' },
  { id: 'cd20838c-8ebf-497c-88f2-7e0c7cc315b9', name: 'Play_DataScience' },
  { id: '0eb52eeb-4924-421a-b0b8-c86dcc3e14cf', name: 'Play_DataScience' },
  { id: 'a71b10a5-2577-4619-9643-13a5bbaa7f10', name: 'Play_DataScience' },
  { id: '178c03d2-18cf-4bf6-aec9-8be63ed628d5', name: 'Play_DataScience' },
  { id: '9efc7ca6-6a36-48dd-b8f8-f0787cc441df', name: 'Play_DataScience' },
  { id: 'a08078d0-11bd-4f59-ac8f-9647c204d679', name: 'Play_DataScience' },
  { id: 'a204d4d9-e728-41e6-b759-99246c260518', name: 'Play_DataScience' },
  { id: '5e107395-3e54-4498-87a2-f27f2a28c801', name: 'Play_DataScience' },
  { id: '5a219d40-1367-445b-870f-738a2b129b38', name: 'Play_DataScience' },
  { id: 'cc270052-99de-4903-aeeb-c703026259c7', name: 'Play_DataScience' },
  { id: 'ca2007ee-e585-482d-8a0e-03847adbe1d0', name: 'Play_DataScience' },
  { id: '73dbb1e2-ce2a-4d70-9cdc-8e03449a5d9b', name: 'Play_DataScience' },
  { id: 'b0317b8c-7106-4a7d-b646-b4ac97a18076', name: 'Play_DataScience' },
  { id: '877a9ff0-bbd2-470e-a70a-e96da9e6ab47', name: 'Play_DataScience' },
  { id: 'ee31bd2e-9cd6-443c-a81d-4a120d596dd2', name: 'Play_DataScience' },
  { id: '49b8e989-a291-4fea-9871-6fdd7ffae6e5', name: 'Play_DataScience' },
  { id: 'd1cc1b1d-303d-4e71-a969-3071af3e1d86', name: 'Play_DataScience' },
  { id: '25185352-cc1d-48d5-b58e-a5d6afff0e0e', name: 'Play_DataScience' },
  { id: 'a4c18d2a-9c38-49b7-bdf2-bb42b34a5939', name: 'Play_DataScience' },
  { id: 'a964fbcc-4a8f-4999-b559-8f6c36331444', name: 'Play_DataScience' },
  { id: '8f1e4d38-17ea-475f-869b-e303bd21b6b7', name: 'Play_DataScience' },
  { id: '054fd523-6fbc-44ba-8552-365dc15c707d', name: 'Play_DataScience' },
  { id: 'f28f6f9b-df1a-47f6-9b3a-768fbe5b7ba6', name: 'Play_DataScience' },
  { id: '3ed36e16-6229-4c56-8d4f-22ac84d04674', name: 'Play_DataScience' },
  { id: '1973b18c-7401-4a44-ae6a-ca5cd3dd830e', name: 'Play_DataScience' },
  { id: '7c9fc645-c9df-4b00-9194-2c70e631f04d', name: 'Play_DataScience' },
  { id: 'a12cfa72-31cb-4a48-aa49-91035d1a92cb', name: 'Play_DataScience' },
  { id: 'faefefd9-8f9a-42e7-9300-b32670b9b286', name: 'Play_DataScience' },
  { id: '9ec2104a-8d12-4aea-958b-dae29f7a7397', name: 'Play_DataScience' },
  { id: 'b6d0b6de-b85a-4a5d-937b-f7afd770c175', name: 'Play_DataScience' },
  { id: 'f19cf186-a047-4a0e-8751-4a57f93977da', name: 'Play_DataScience' },
  { id: '8cd676fc-62d3-4a2e-96f3-22a9e9198739', name: 'Play_DataScience' },
  { id: 'a1b2a903-3a54-475d-b10c-5005f8ece7a6', name: 'Play_DataScience' },
  { id: '4a117db5-9bf8-4e79-9ce1-dfff5b849715', name: 'Play_DataScience' },
  { id: '58945aa1-51bf-493e-8260-03d696357abf', name: 'Play_DataScience' },
  { id: 'dd5823d6-9853-453c-8653-3f312ea76ca7', name: 'Play_DataScience' },
  { id: 'afde233d-2637-4a36-b360-7ed9461499be', name: 'Play_DataScience' },
  { id: 'a5133d35-8e89-4cbc-9eaf-d1562fdbc191', name: 'Play_DataScience' },
  { id: '031b67ab-35eb-4398-9308-3150ec6920e4', name: 'Play_DataScience' },
  { id: 'a984c9d6-ad93-48eb-84ce-0ee6f842c52f', name: 'Play_DataScience' },
  { id: '9d2d447f-3a67-49b9-8878-9e8482f7bf94', name: 'Play_DataScience' },
  { id: '75f60b15-a737-417d-96e3-0dd51b3e336c', name: 'Play_DataScience' },
  { id: 'de8516c3-6ae5-4d33-842e-c106b31de321', name: 'Play_DataScience' },
  { id: '8f132569-93bf-433f-9498-3c591a260126', name: 'Play_DataScience' },
  { id: '0f85b571-df46-408a-a8ee-0c9ca53ab62f', name: 'Play_DataScience' },
  { id: 'ddf15bc6-7af6-4729-a28b-a403695cacdb', name: 'Play_DataScience' },
  { id: '4eeca578-0c7e-441f-86c0-d6bea04562be', name: 'Play_DataScience' },
  { id: 'b08fbd33-a550-4540-9cb3-59986cddc9e7', name: 'Play_DataScience' },
  { id: 'b739d840-eef8-4897-b492-d5576719a561', name: 'Play_DataScience' },
  { id: '36164ba5-6401-4c64-82af-d3b30de639cc', name: 'Play Guides' },
  { id: '28fecc93-ecef-499e-9f94-1e31cb58a319', name: 'Play Guides' },
  { id: '537cfd8e-e128-4126-b1f6-97e374ec9334', name: 'Play Guides' },
  { id: '9bc3e99b-42b1-4846-b3b3-8a73e198cefb', name: 'Play Guides' },
  { id: 'b399a76f-72e5-427e-a99d-8b0da6a29ec0', name: 'Play Guides' },
  { id: '4977a0db-86a4-476c-87af-34e52f39fcfc', name: 'Play Guides' },
  { id: 'c0fb8901-54fe-4365-b715-52d7073c7be9', name: 'ExampleProject' },
  { id: 'a4274834-8ab7-47dd-81dc-fa18a52cfc68', name: 'ExampleProject' },
  { id: '78d97c6a-20fd-4bb5-9686-4c7dd5f887c4', name: 'ExampleProject' },
  { id: '0f14bd4b-5d36-4197-a967-05e0dfa6a32a', name: 'Test_Playbook' },
  { id: 'cd20a18f-9d13-4361-94e1-718271dc4317', name: 'Test_Playbook' },
  { id: 'cfdfeb37-b8d2-481d-ab16-7587dac083f6', name: 'All Play Guides' },
  { id: '5aecb8c0-ee59-4416-9224-fc37e4f5f231', name: 'Northwind' },
  { id: '5fd0db5a-57b6-4fdb-bda7-b1c73d0ba3e2', name: 'Northwind' },
  { id: '81f49ef7-a078-4018-a2f5-e9bdf4028f12', name: 'Northwind' },
  { id: 'ff9f0196-d2f8-463c-bad8-ea1ca1d0db3f', name: 'Northwind' },
  { id: '7be7bbbe-fef9-4824-979c-353bbe4adc44', name: 'Northwind' },
  { id: 'f7bfc40d-d435-4d6b-a928-78eee23c91a2', name: 'Northwind' },
  { id: 'd651ef16-5e81-4c21-96c2-02f005d716f2', name: 'Northwind' },
  { id: '3b24fce4-566a-4f56-8c18-32461a536a62', name: 'Northwind' },
  { id: '6161f570-4e77-4ffe-8c9a-f6c2d8f3721b', name: 'Northwind' },
  { id: 'a2cc9bb6-09fa-45d1-91a5-c3fb2bdaf6ea', name: 'Northwind' },
  { id: '61942957-a7d5-43a5-9143-31937b240eae', name: 'Northwind' },
  { id: 'ec18c102-40c2-4073-acd0-e2e8b65a0a12', name: 'Northwind' },
  { id: '58684909-2eca-4838-b344-42f6bb9ece70', name: 'Northwind' },
  { id: '291b9f68-b711-4675-82c6-36f8cab7fec8', name: 'All Play Guides' },
  { id: '1746146a-dbf7-486d-9c30-f6930c2a01d9', name: 'Airport_devworks' },
  { id: '763eedf0-7193-430a-a5ba-7513a9581904', name: 'Airport_devworks' },
  { id: '69b53aeb-12c6-4bb0-8a31-e0fc1dd654ff', name: 'Airport_devworks' },
  { id: '425bbb42-e147-4058-a250-56a86ead94ef', name: 'Airport_devworks' },
  { id: '1433b581-799b-4b2a-a43d-592d6c669181', name: 'Airport_devworks' },
  { id: '7ebc6819-0660-4c2b-92ef-850909900151', name: 'Airport_devworks' },
  { id: 'd0e4c4d0-f6e8-4ebd-920a-20993363296a', name: 'Airport_devworks' },
  { id: 'a3517d36-d28e-4da2-adad-cbf66dcdedd6', name: 'Airport_devworks' },
  { id: 'ad586329-13eb-47e3-8ca8-0369a4267d99', name: 'Airport_devworks' },
  { id: '0ba1e596-6fd1-40c4-8780-00b118cc4550', name: 'Airport_devworks' },
  { id: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851', name: 'Airport_Class' },
  { id: '867398dd-f68f-414d-ac81-63428c037a3e', name: 'Airport_Class' },
  { id: '0ea212e6-d6a1-482a-8c9a-91999e41eef9', name: 'Airport_Class' },
  { id: 'f41258a9-a556-4066-875a-593e22500783', name: 'Airport_Class' },
  { id: '95200b0c-e88b-4667-a58e-e08df057c4a3', name: 'Airport_Class' },
  { id: '8d110f12-21e9-40da-ab82-63afb823d93f', name: 'Airport_Class' },
  { id: 'c05e037d-805b-42b6-84db-f5404ef18c01', name: 'Airport_Class' },
  { id: 'd472d2cc-5db6-4b5e-90de-43685a893aff', name: 'Airport_Class' },
  { id: 'ead61ba8-5a3a-4e43-8786-e19767f4037b', name: 'Airport_Class' },
  { id: 'a7384f2c-5280-4aa0-bd69-0871ed30a302', name: 'Airport_Class' },
  { id: '2c5bbe0f-219e-4b5a-ab8f-c4cdf10ccbb5', name: 'Airport_Class' },
  { id: '3d091248-e2f0-4818-b68f-fef25e3ea4f5', name: 'Airport_Class' },
  { id: 'ca76cd5e-5cbe-4b41-8e7a-36bfd26eda65', name: 'Airport_Class' },
  { id: 'b0752878-67f7-461e-a954-8afd44a7e981', name: 'Airport_Class' },
  { id: '0770b2dd-9a53-473d-a595-6f881e422024', name: 'BOM_ModelingClass' },
  { id: 'c59ffbf9-51d8-4769-b02b-39d245c00afd', name: 'Dates' },
  { id: '10ff3ebe-4a1c-4484-995b-86ff74699fee', name: 'All Play Guides' },
  { id: 'a0be4ad0-01d6-46ed-b05c-0cee6033ad55', name: 'JDBC' },
  { id: '0c14b4a8-2bb8-452a-8c03-e0c7a017c799', name: 'JDBC' },
  { id: 'd1ec2693-691e-4064-9aa8-eb5ed17a3cc3', name: 'JDBC' },
  { id: '98ec6d22-fc51-496b-9242-cf65daa6d8e6', name: 'JDBC' },
  { id: '7662bb10-8773-488c-9710-2cf386524da8', name: 'JDBC' },
  { id: '1050b419-a475-47d6-bd2b-8de8f0af0e86', name: 'Json' },
  { id: '7cc42892-0081-404b-8d10-d741250dd2cd', name: 'Json' },
  { id: '89cd07e1-46f9-4f80-91dc-6ed935fb1c2b', name: 'Json' },
  { id: '5dae727b-bc77-43cb-b175-a536708909ab', name: 'Json' },
  { id: '1a666fa7-7788-4d1a-afd1-7d611a1c1bd0', name: 'Json' },
  { id: '01240e35-4939-4113-a8c7-ecd787253b43', name: 'Json' },
  { id: 'f710b1b0-30f3-4f52-878d-47710a69318b', name: 'Json' },
  { id: '9306c44e-b3c2-4304-bcfb-c4e0e4717866', name: 'apoc_load_csv' },
  { id: '1d8859fa-04a3-49ea-9f22-542c19175a1a', name: 'apoc_load_csv' },
  { id: 'af2d85de-273a-4256-b9c7-57a873314a84', name: 'apoc_load_csv' },
  { id: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02', name: 'PLAY GUIDES' },
  {
    id: 'dff24df8-be80-48d4-912a-0a84e92b1aa3',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: '5c285204-1717-478d-b02b-3a6cf3c8ecf2',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: '696b260c-c79c-4ec9-98a3-36323e977ba4',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: 'a98ba81c-e818-4ae3-9dbd-bb1a558353cc',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: 'efc94176-3b11-4a27-878f-c7a1795771f9',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: 'c63deb0a-9bac-40e6-8be3-f0d085bb9789',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: '53ddddeb-04b0-49fa-b380-16ab398627f5',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: 'f0f56cc6-0641-42a1-80a0-8b65dd1f2648',
    name: 'A_GDSCLASS_testing'
  },
  {
    id: '99d72f29-5bbf-40fa-b227-b67c094bcd88',
    name: 'A_gdsclass_testing'
  },
  { id: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c', name: 'A_GDS_Retail_Demo' },
  { id: '6464de6e-c9ef-443a-a059-4ea79634733a', name: 'A_GDS_Retail_Demo' },
  { id: '387992a1-85e4-4871-8e45-64170c79ed02', name: 'A_GDS_Retail_Demo' },
  { id: '5cbb6c88-4d15-420d-b1a3-5354b5454e6d', name: 'A_GDS_Retail_Demo' },
  { id: '8fd36929-f06a-4c65-a3d6-fcb76e302c72', name: 'A_GDS_Retail_Demo' },
  { id: 'ebbc0cd3-36a6-4011-8403-fadd40e1258f', name: 'A_GDS_Retail_Demo' },
  { id: '07454a7d-ab0d-4ac5-8f88-e478abc21aa9', name: 'A_GDS_Retail_Demo' },
  { id: 'bccc2e93-5e2e-43e9-93d3-0caa6dcb1b86', name: 'A_GDS_Retail_Demo' },
  { id: '8deacfc0-2c4a-44a2-9cc8-7e261bb8ccc3', name: 'A_GDS_Retail_Demo' },
  { id: '40083165-ec63-4f46-940e-30a0438c605c', name: 'A_GDS_Retail_Demo' },
  { id: '05dfa605-2d00-4a49-bdf4-42d038884c15', name: 'A_GDS_Retail_Demo' },
  { id: '16019df3-ebe0-403a-ba1f-dcca735e06a9', name: 'A_GDS_Retail_Demo' },
  { id: 'e874e9fe-bd88-43bf-a7b8-e9516bef4978', name: 'A_GDS_Retail_Demo' },
  { id: 'daa0adf0-6d71-4cb2-aa8f-3cfbf71dd190', name: 'A_GDS_Retail_Demo' },
  { id: '1f83576b-9ee3-423c-8e34-3566e1fb5d9d', name: 'A_GDS_Retail_Demo' },
  { id: '2cf0d62c-ef49-418f-bb41-aeb5fa564dd7', name: 'A_GDS_Retail_Demo' },
  { id: '7cc33020-45d7-40ba-b73b-f2c43db5e2f3', name: 'A_GDS_Retail_Demo' },
  {
    id: 'dca56121-1ba0-492d-a1c4-86cb61b14887',
    name: 'A_gdsclass_testing'
  },
  {
    id: '5edb6449-1f59-4e18-966d-3f8d12b0cd1b',
    name: 'A_gdsclass_testing'
  },
  { id: 'b6d68ee8-a6a6-4197-bfb3-7c6d06e65a5e', name: 'Data Validation' },
  { id: '2cb72fd8-0277-4b6b-91c4-96db018c6531', name: 'Data Validation' },
  { id: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a', name: 'LinkedList' },
  { id: '6dca731d-f423-47eb-bd3f-b803015e4155', name: 'LinkedList' },
  { id: 'e2220ea4-dd91-47fe-a9d4-a3c6d3cd86e8', name: 'LinkedList' },
  { id: 'ff35812e-f052-4900-a016-41364baaa4ff', name: 'LinkedList' },
  { id: '6837a54b-6965-4a2c-9566-afd3ffa8b5ab', name: 'LinkedList' },
  { id: '66cf7c82-3ffe-4bd1-b325-4d22d4cca07b', name: 'LinkedList' },
  { id: 'b3a1c1d9-864c-4906-9cd6-35d3f418f263', name: 'LinkedList' },
  { id: '04c36563-4e63-40a7-a2d2-627e9d9c6019', name: 'LinkedList' },
  { id: '3ef9da70-205f-43ba-9961-c782e067a60f', name: 'LinkedList' },
  { id: '9774eaaa-c185-4311-bff0-bcc6dee198d1', name: 'LinkedList' },
  { id: '7e1c1618-a7e1-420a-8215-d127f34a9f4c', name: 'LinkedList' },
  { id: '9c693287-b83b-4a7c-ac78-1330b9261e57', name: 'LinkedList' },
  { id: 'ae093102-8bc4-4e1d-aa8e-36d69db25556', name: 'Cardinal' },
  { id: '3cc099d2-19bb-4209-bb9c-172ece577855', name: 'Cardinal' },
  { id: 'e035c46f-982e-4f10-942d-2f2ff97ab1e2', name: 'Cardinal' },
  { id: '909bbdb4-e472-4d28-8fc5-326adf67585d', name: 'CSV' },
  { id: 'c906d491-1a8f-4fc4-b27c-fafa2512e9bc', name: 'CSV' },
  { id: '0ddeacad-a62e-42c7-a6d0-50cbea93b468', name: 'JDBC_mysql' },
  { id: '20315ade-508b-4491-a019-16fda725c88d', name: 'CSV_apoc' },
  { id: '6a35c97c-6bfa-4cbe-ad09-f40b4f2f7b9b', name: 'apoc_load_csv' },
  { id: '3d80a9f3-56ad-4e6d-971f-c779d2d53901', name: 'apoc_load_csv' },
  { id: 'a94cd201-c4f3-478b-8418-91e08cf4d2f9', name: 'apoc_load_csv' },
  { id: 'd3b7dca9-2f36-4c1e-b142-d17e757dcdf9', name: 'JDBC_mysql' },
  { id: '1d166a2c-ccf9-4bdb-ae93-7171a22afba5', name: 'JDBC_mysql' },
  { id: '464e2c63-a6cb-490c-ab6e-3bf51c9b1e1c', name: 'PLAY GUIDES' },
  { id: 'f4a62305-d9d7-4933-8d25-4f33e2065ecc', name: 'fincen' },
  {
    id: '0eed1e4f-3d8f-48f2-b657-9c3691325f08',
    name: 'A_gdsclass_testing'
  },
  { id: 'b1411242-c053-41c8-9adc-c71bb871cf05', name: 'New Folder' },
  { id: 'f32759b6-e3ce-4609-aff2-7ebaf2fafc51', name: 'New Folder' }
]

const realLifeFavs = [
  {
    folder: 'basics',
    content: 'fav-content',
    versionRange: '0.0.0',
    isStatic: true
  },
  {
    folder: 'basics',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'basics',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'basics',
    not_executable: true,
    content: 'fav-content',
    versionRange: '>=3 <4',
    isStatic: true
  },
  {
    folder: 'basics',
    not_executable: true,
    content: 'fav-content',
    versionRange: '>=4',
    isStatic: true
  },
  {
    folder: 'basics',
    not_executable: true,
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=4',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3 <4',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'profile',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'graphs',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'graphs',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'procedures',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'procedures',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'procedures',
    content: 'fav-content',
    versionRange: '>=4',
    isStatic: true
  },
  {
    folder: 'procedures',
    content: 'fav-content',
    versionRange: '>=3 <4',
    isStatic: true
  },
  {
    folder: 'procedures',
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'procedures',
    not_executable: true,
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    folder: 'procedures',
    not_executable: true,
    content: 'fav-content',
    versionRange: '>=3',
    isStatic: true
  },
  {
    id: '6a99b8a0-00ef-4294-8709-d58556a928ed',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '44fb2568-dab1-42bb-b2aa-346dbdfe7b9f',
    content: 'fav-content',
    folder: 'f4a62305-d9d7-4933-8d25-4f33e2065ecc'
  },
  {
    id: '21c180f4-b4e4-4dc5-a8f3-2fc94f557098',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '00087371-dbb3-41eb-896c-1d54844d01a4',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: 'd301ed97-cea2-4b16-b664-5ded17c7fd4a',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '22c730eb-4834-4a55-a540-ce865d36aae9',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  {
    id: '65a8c02c-ccc3-4f7b-8498-2d35fd19b646',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  {
    id: 'c2fb58dc-bb11-43e9-b5dc-38e94b46cc2e',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  { id: '6d663699-bbb8-436a-8d60-b5063f19c8d8', content: 'fav-content' },
  { id: '9e60d1ac-b8b7-4295-91d4-424c02f3d5d0', content: 'fav-content' },
  {
    id: '4bb1db74-e900-4670-8d34-391683608794',
    content: 'fav-content',
    folder: '20315ade-508b-4491-a019-16fda725c88d'
  },
  {
    id: 'ed7ff3c7-c3d5-4dc0-9ac6-c0fbcb6b6394',
    content: 'fav-content',
    folder: '20315ade-508b-4491-a019-16fda725c88d'
  },
  {
    id: 'f5bdd810-cebc-4abe-9566-1b0af1a65739',
    content: 'fav-content',
    folder: '20315ade-508b-4491-a019-16fda725c88d'
  },
  {
    id: 'bb62747c-5239-4d6b-b612-685bd20bac8d',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '893c4a68-5b01-4603-a294-e541b703180c',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: 'b7417c01-a937-4485-88f3-73fb203fbf8e',
    content: 'fav-content',
    folder: 'ae093102-8bc4-4e1d-aa8e-36d69db25556'
  },
  {
    id: 'bb265f50-1243-4342-a81f-e8267c1eb7b7',
    content: 'fav-content',
    folder: 'ae093102-8bc4-4e1d-aa8e-36d69db25556'
  },
  {
    id: '725473ed-9ea7-48dd-83ba-53b8deb2f10b',
    content: 'fav-content',
    folder: 'ae093102-8bc4-4e1d-aa8e-36d69db25556'
  },
  {
    id: '575ec934-9c44-4d0f-a2f1-efd2d25a3dfa',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '099587d3-3e8b-4d04-aa5c-4f82e1ab6f57',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: 'c9541c0d-4c3c-4110-b3a1-2b2ec7fa277f',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: 'd61b4701-67bb-42d8-af0c-149288540a3a',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '7680769c-1660-44d3-bc72-09f996d1494d',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '2ea46ad7-ca99-49b9-8159-05dd7eb838af',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '17db6bc1-2ef0-4f7f-8d4f-e241378c7022',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '38aacb7b-0aee-4b25-b0a4-731c81bce4d9',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: '13e3868f-8fd9-4f2b-b32b-88ee6c4a1fbd',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: 'f0df6189-0596-48b9-aaa6-87e84db1a349',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: 'c6d520f2-7160-4b98-a0c6-8120004f57dc',
    content: 'fav-content',
    folder: 'f3bfd6e8-d677-4cd5-bd9c-ec56bdd2397a'
  },
  {
    id: 'e4904339-2aaf-4bd4-b1e9-236764768d74',
    content: 'fav-content',
    folder: 'b6d68ee8-a6a6-4197-bfb3-7c6d06e65a5e'
  },
  {
    id: 'b2eaf232-0b5c-4870-84cb-365ef34816a2',
    content: 'fav-content',
    folder: 'b6d68ee8-a6a6-4197-bfb3-7c6d06e65a5e'
  },
  {
    id: '0c20f9c7-d06f-4490-a7c8-c2767f35917d',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '1b576c19-c5b1-493c-aee0-c47dff37997b',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'da97c4f4-85db-42ed-9f81-a69a4b264ebd',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'ff4100ae-c7ed-4537-aa5d-1ef90dd77b41',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '52d1e6d1-9939-491a-ad9a-f94efb5bc4c9',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '3fc27c73-bd76-4534-bd04-041ed75b5e15',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'd072e931-3174-4ac4-aa1b-89d5aeb1e507',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '57472ecf-cd87-4b32-82eb-e90586b0ccc1',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'a0214136-6888-41a1-8190-3c2b13083f04',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'cb6b1280-3222-425c-8614-192d8b05996b',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'a0b254ec-62f2-4a17-afc9-a96b1939d689',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'b3f1a03c-e708-4343-89e2-a65755152e98',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '9783b33a-81ed-4a7a-8e81-514ed3ea9b4c',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '76541b73-6f42-4382-acc8-12ddef5a9ba0',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '1b3aacb6-289e-42e7-9ef4-8dd405201500',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '132293e3-6dbb-4d50-ba3c-52a836746d50',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: 'f31410cf-1023-498b-a558-9579de18f5ff',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '09219b4f-442c-4fa7-9379-c90cb2afcf05',
    content: 'fav-content',
    folder: 'b1d5a702-ed4b-41c2-b70a-9b68e42af62c'
  },
  {
    id: '3337d155-830b-4fc3-b04c-e7393d013bac',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '43c37671-83e7-4d9f-ab0b-3940085c1c0b',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: 'a11cdeb5-aece-4b39-bd81-c001d915b87f',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '4ad8b912-9ff3-4b8c-b909-12f650c15b10',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: 'cfbb754a-7317-420a-a673-714366cd5bed',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  {
    id: '974d5232-3702-47cf-9998-cf8560260cfb',
    content: 'fav-content',
    folder: '99d72f29-5bbf-40fa-b227-b67c094bcd88'
  },
  { id: '845099dc-f747-4a62-afbe-9a68a174bc2d', content: 'fav-content' },
  { id: '7345f390-2f47-458e-8d0e-7d0a6580bd31', content: 'fav-content' },
  { id: '672505c9-ccfa-4901-8511-a83509a26e8d', content: 'fav-content' },
  { id: '38b32a40-73f7-44af-970f-e832ef75c8c9', content: 'fav-content' },
  { id: '9fe95d49-f356-4ddf-89c7-4cebb76742ce', content: 'fav-content' },
  {
    id: '08417514-6a38-4ba7-89b3-2e8f660b3cde',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  {
    id: '9f376514-d1fa-4358-977d-6b065dffd411',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  {
    id: '31e27cf9-7698-428c-8127-f29f595efb8f',
    content: 'fav-content',
    folder: '9306c44e-b3c2-4304-bcfb-c4e0e4717866'
  },
  {
    id: '8f9d4b06-0edf-4664-aa5f-b0e5505c4bef',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '78f45718-3d6d-4394-8cd7-63f3b84bac94',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '6fb557ea-b473-41fb-a3fc-c4812b401227',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '6d6be168-1099-4d4a-bc78-c53880f3732b',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '33057c15-de63-4e98-8466-6619400806ce',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '305cc828-05b9-414e-a6b0-1b009eb4a99f',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: 'ceda8cde-9766-4f4f-81dc-f62ef30de84f',
    content: 'fav-content',
    folder: '1050b419-a475-47d6-bd2b-8de8f0af0e86'
  },
  {
    id: '23412d74-f310-409b-9d11-5258772fa917',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '72336771-1981-4b3a-8b82-3832cf1bf178',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '662e4775-62dc-4581-a9a6-dc9d293c6454',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '7f63353b-9cf4-408d-9737-5a687df6eab1',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: 'cde3577a-1e0f-4b08-8a32-bfbbf6ca62a2',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '04b7f19e-a401-425c-84c6-abff2fd25c38',
    content: 'fav-content',
    folder: '0ddeacad-a62e-42c7-a6d0-50cbea93b468'
  },
  {
    id: '5a5ee86b-e63e-4c65-86c0-50a831bf36a8',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'b6010864-4240-4dce-a66a-5f093266c773',
    content: 'fav-content',
    folder: 'c59ffbf9-51d8-4769-b02b-39d245c00afd'
  },
  {
    id: '2c917ece-96c1-453b-ac66-89f234221c5c',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'cec86c1d-6b88-49e3-aca7-b02e35be892b',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '62fb43c1-14fc-454f-85dd-cd78377b49a9',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: 'a156da2a-8086-4ab0-84ef-051f356dfdf2',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: 'fb9f830f-3b26-42ce-8f42-1f16046e2ed5',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '6e922fe2-3658-4bef-a83c-db44a69d2043',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '302fbd56-0fd0-438c-a306-dcf79aa4ebab',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '7fc9e35b-03e2-41c2-9d7e-afe526ec472b',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '08d755f0-ef6f-4ac2-bee3-0775b3a68434',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '180fbdb9-6ce7-4c80-af4f-6b85e0d290d1',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '1e88529f-2bfd-459f-9317-273cf9013c2d',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: '26a29e45-e3c8-4059-83ad-9f68864392ed',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: 'af64bedd-1bd4-4d0e-b7ab-36f91af3c217',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: 'b6f77ae1-931a-4a1e-bcad-88a3647dbb0a',
    content: 'fav-content',
    folder: '02f19e2e-3b95-45e0-ba60-bbb8a19c8851'
  },
  {
    id: 'fa6f71a0-4625-475f-ad60-2cf980d29fbb',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: 'a36ec022-5099-45d2-af07-f448c80c4e8d',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '0119d656-bf3e-4568-b519-2320901911b4',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '7d219de5-bfa8-42a1-b9e0-12dff92d7a56',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '9c43de27-d215-4b27-899e-3d26d4b232d1',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '9020a111-ab73-4d49-a1ab-b6e95530cea9',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '4ab94e00-ec82-4e68-a857-d2f3435960c5',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '3e5cfc59-43fd-477d-a599-fd65e2273db0',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: '75468dfd-2e8c-4b44-916f-8f01372ba3ad',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: 'bc3ac0ba-7b39-467c-9f6a-e8ae16f07712',
    content: 'fav-content',
    folder: '1746146a-dbf7-486d-9c30-f6930c2a01d9'
  },
  {
    id: 'b8833250-f74c-4eaf-b514-77f20d388cea',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '726653fb-555a-4d53-a1c9-9b0c6d1b55d8',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '4147cf51-b3ae-4506-b5e2-5ce597837d69',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '7bbf483b-1d55-46fd-b3cc-c76b8573752e',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '2d917dfd-12c7-451e-a0e6-6b51e26fd91e',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '38bb27bf-b436-4bf3-8581-e7190a27583e',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '4c9bb3d1-8a52-4490-94db-e2641248e1c2',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '453bfed3-6600-4a5b-8acf-67cc63eb4c98',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '68aaa6e2-5717-4c1d-ae0f-0f719f9d055e',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '57028684-d642-4b31-ac28-bc0b64ec163a',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '27137a2c-9be4-45da-a78c-020107e2c18d',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '05dbf49d-46a6-4f66-880c-b615c3b95453',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '91c60386-e25d-47b8-bd74-222ad813d564',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '64f9299c-4187-4756-bb86-c55cab675c1a',
    content: 'fav-content',
    folder: '5aecb8c0-ee59-4416-9224-fc37e4f5f231'
  },
  {
    id: '4bbd97e6-c289-4c91-acd8-332d699ab222',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'bf9a652e-db60-4a72-bbb0-9938e2ee4d28',
    content: 'fav-content',
    folder: '0f14bd4b-5d36-4197-a967-05e0dfa6a32a'
  },
  {
    id: '9f7b279b-3f5b-4011-bdcd-3161cc3bea59',
    content: 'fav-content',
    folder: '0f14bd4b-5d36-4197-a967-05e0dfa6a32a'
  },
  { id: '5beea017-9c51-4b86-8686-6080eef72ba9', content: 'fav-content' },
  {
    id: 'df81e51a-748f-419e-a5fa-aa114889b572',
    content: 'fav-content',
    folder: 'c0fb8901-54fe-4365-b715-52d7073c7be9'
  },
  {
    id: '04363d5d-1233-4dac-bc5d-54dda0e14d7c',
    content: 'fav-content',
    folder: 'c0fb8901-54fe-4365-b715-52d7073c7be9'
  },
  {
    id: '12bb1adc-e510-4fe4-932f-6bc4f3be69c2',
    content: 'fav-content',
    folder: 'c0fb8901-54fe-4365-b715-52d7073c7be9'
  },
  {
    id: 'f214a950-1e03-40af-baa7-69829da43e95',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '09d30f99-4352-4801-8868-2044cfde620b',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'deedca8d-5d00-4cf2-9650-6dfb813f354a',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'f8a4230f-f58c-4d2b-a0ba-504bec1960c1',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '4dc90054-1849-410c-a837-5d4591190f3b',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '31d0b58d-a83a-4a03-97ca-9f8ce08836af',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'ec956710-2b2e-40bb-aa5a-84fb2d859bdf',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '4c548acf-5a6c-43c0-858d-44585faffbe5',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '3c444a5c-6f43-4e75-93ed-626937006d20',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '671784bc-95d7-4240-be0f-a3fe3aaffa93',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '3c5bb41e-9406-400e-ad58-5a9c0e60922b',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '32e3e9aa-856b-4780-a75c-15651f06f6ab',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '53528a20-6add-4e45-a00e-3f9bfd9eea9f',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '8d6fbf39-5851-4744-a943-47e51aba4b41',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'd456e52d-557d-4389-908a-7214ec861551',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '11abec22-1329-456f-abeb-37b6e0759b03',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '1ec58973-2d6e-4a05-ad94-da78d57ed299',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '0bb06988-bc7b-4d43-8a92-a30f6ad4eb2b',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'dbb5f585-6576-46c7-b2ba-1572befc955c',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'e1b7f098-40dc-4990-9de2-27b59a727532',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '8c543a6c-861a-4e77-b9f0-e0c3fef0aabe',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'c9b6f542-6f91-47e2-ba71-f4d92b0a49e1',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'e56188bd-ea69-4ec4-a0db-632765d44608',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'b9e27ed4-1f4a-40c5-a7d2-13949657863a',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'a6cdb005-9a9a-4d5b-9e4d-5acad34a4411',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '3dd584c4-21b4-4b9b-9ede-d073a434f76b',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '1996f89a-aae4-4ae5-a4b0-9267fd2cb702',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'c45273e4-e855-4c8a-9363-0198673925bd',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '55f920e3-b981-4249-b58d-2179bb7b8b47',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '7fe5097d-f6b4-4d9b-b18a-ecaefd8748ff',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'd7f60ad6-af10-4386-9e8f-4f19957d4fc3',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '87f43afa-4cbd-495c-9b9c-237246a28248',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '9938d86f-cc2c-46db-b026-d469366587d9',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '19415861-4af4-4a12-afc2-cc495a658336',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '53d4fd63-0289-4b06-ade2-7f3c6c8d80c6',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'd36704d4-3188-49d3-9eb3-6e29e287394d',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '5c0dc63f-b3cd-413e-87b6-3ecc5fd252b4',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'eaaa25a9-345a-43bc-9c51-f95175e3f495',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '8220d8b6-9605-4a70-93d7-f23fedf399b0',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '20dfbaf6-a1a9-4c83-bbf2-c9c5c66e2d38',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'da004862-bc57-4e15-8848-5763443b1268',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'ead6dbc9-9d79-4899-a52a-4b8493072b9e',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '43dd083f-b754-40b3-95b2-1326abfa2c83',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '10fee43e-f507-4aee-89f8-25fe678be378',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'b01b37ae-aeee-4695-8743-d07ab18e8994',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '171e23c1-b858-44a4-999f-0b1a3d07131d',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '68c9762d-a4c9-4ebe-b950-a042333bfa15',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '231c5d31-12f2-41bd-98de-1ee48b29cc1c',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'da928bfd-a9d8-4219-a12d-2c3d92eb53b7',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '3e181dec-329d-4066-8e64-a56ae26101b8',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '4a1b2524-8164-4b76-831b-07f9e365b01c',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '13f6d782-0361-4aa4-a8dc-02d497cebed6',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '61eed2bb-878f-48b8-9849-e5a2aecb6fd4',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'c9cc66ee-d8fb-4fda-ada4-f3956d32a6f8',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '59a91814-2ec5-499b-882a-d89f279446fe',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '9e384e4e-7f1f-4a05-b90a-c7308a370351',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '035afbd2-3dd5-4b8b-9568-4246161f2074',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '16e9e455-8fdf-4b7f-bf62-04ad51075a11',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '3fdc0b16-23eb-45ca-8d71-ed6f17d0becd',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'f75ae2e7-1329-49bc-98ec-317151a86e7f',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'a203fff1-2562-4088-baea-fdbeac5cb9e9',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'aa65bfae-dec3-4b85-9821-5cde7950369b',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'eba0b510-3f4c-4202-853f-8d153965a4e5',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'ca784eaf-d917-4a87-86ad-a00afb60e7b4',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '23178877-be43-480b-ac6a-c16e1b92f1ce',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '9bad6f92-9596-4761-9a53-73a0b549e0be',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '9417eaf7-2399-461e-86e4-160adc4fe645',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'ccdbd792-2693-4767-a019-ea8f8e8c7dc8',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '489a0b50-d320-46c7-9184-35c2b0f32844',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '1399dc41-52da-49f1-8272-35b134196b6c',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '97050b66-8c94-428f-bf8b-8b4e8dde9c77',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'bf975737-afd7-47cf-bbda-ee10862da250',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '2f463445-1e13-4d59-a696-f1ce1aaef72c',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '807116e8-2e75-43cd-9daf-1bab94ff2aba',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: '1cb9b8ff-efe8-4875-919d-b7d925841363',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'b784ceb9-43aa-4af5-bfa4-192b7d320595',
    content: 'fav-content',
    folder: 'abccf0dc-f510-431e-83eb-176b78188b8b'
  },
  {
    id: 'ac53c45e-fb3a-454b-92fd-af72b641b573',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'a2e338b3-bee9-48b1-bc91-b2377fb272c1',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'e90c8489-a744-4789-8d46-c73a7a0df8e6',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'ba44c827-cc88-4f6d-85d5-505631c1e47c',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'b23336aa-4826-4c59-b6c6-a32507b823db',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: '5b4f71c5-2acb-4fc3-8664-483d99e01252',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'b4477a84-c9ae-410c-9f87-18b3f1c8a865',
    content: 'fav-content',
    folder: '177b0687-5ded-458f-b07c-47ab1de83f09'
  },
  {
    id: 'd5692149-d773-45c2-b967-ee078af301bb',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '4840224a-e75a-45c6-bed4-858ff70355f9',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '00c065b7-ef77-416c-b793-468e7c15c2b5',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '0804e3a5-16f0-4feb-b1b1-7b7d192fd1cc',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: 'd6422c4b-44be-452c-a9d3-a148157ca834',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '2bdd9f40-5e6b-4c0d-8a84-fc8f904311c5',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: 'f323dd98-4beb-4e4e-af1e-f2444b87dae8',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '17a4d175-e230-4795-bd9c-c10130c4ed50',
    content: 'fav-content',
    folder: '87ffa549-bc9d-451a-94d8-886ddfe22c53'
  },
  {
    id: '44b3598d-17bb-4d3f-bdbe-243cdb9338c5',
    content: 'fav-content',
    folder: '21716228-3f62-451a-b421-8cb5a7b44fcf'
  },
  {
    id: 'bb3da711-373d-4a6e-801c-88c157a9886c',
    content: 'fav-content',
    folder: '21716228-3f62-451a-b421-8cb5a7b44fcf'
  },
  {
    id: '34a54a0b-cb4e-4e9e-b05c-b49c12a225c7',
    content: 'fav-content',
    folder: '21716228-3f62-451a-b421-8cb5a7b44fcf'
  },
  {
    id: '9bbb2f11-1d2f-40be-80c6-c37f7a149443',
    content: 'fav-content',
    folder: '21716228-3f62-451a-b421-8cb5a7b44fcf'
  },
  {
    id: '962942d1-2e03-4a9e-8edd-5256bca8b1da',
    content: 'fav-content',
    folder: '21716228-3f62-451a-b421-8cb5a7b44fcf'
  },
  {
    id: '2248f8fa-45ac-401b-be2e-df0b07720236',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '98174bd8-b88f-40e8-ad80-0dc2940dcc9b',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '86706160-3af7-4751-a1e6-e63cedec695d',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'e532d3aa-d2f4-482b-92e6-2d2df45b44d0',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'b08fb7ef-9438-4cf1-8407-8ff92c47bae4',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'd9d3a8dc-b29a-4dae-a8b1-b39aa802cc9d',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '5bcf879f-ca65-4090-93d8-85515df2c4bd',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: 'dc4dd54a-5984-446d-b9bd-ea9247902857',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  {
    id: '5ddbf1de-09c2-49f2-9bb1-f27e0e464b0f',
    content: 'fav-content',
    folder: '48c1ddd5-de07-4713-9c0d-5d8a1cf51a02'
  },
  { id: '22bc7a58-cc4a-4d50-9ccd-d0def98203a3', content: 'fav-content' },
  { id: 'f1d7457b-7269-43f1-b145-70e8a17cdec6', content: 'fav-content' },
  { id: 'be52dc7c-309e-474e-9b89-476bf31de5f6', content: 'fav-content' },
  { id: '1f248b0f-5aae-408a-9e13-9b6c193884bc', content: 'fav-content' },
  { id: '99829b91-6fc4-42ee-a959-9993b6a57982', content: 'fav-content' },
  { id: '11ca081b-e035-4aa4-ae48-2877c4b9121d', content: 'fav-content' },
  { id: '5d682edd-eed9-4903-b080-273e6a7d1b7d', content: 'fav-content' },
  { id: '8d10a5e3-af47-44a4-b488-7e9bae098bbb', content: 'fav-content' },
  { id: '37d6f5bf-e738-4574-a5d3-db9855d9142c', content: 'fav-content' },
  { id: 'fd2be412-dd71-4812-ad01-a0cded803b0f', content: 'fav-content' },
  { id: '161a30bf-c024-4533-916e-25320f4d60e6', content: 'fav-content' },
  { id: '45d38d11-4aa0-4c44-a17f-59fd75a28323', content: 'fav-content' },
  { id: 'cdcaf3c4-8808-42e8-83e2-e4dd1e89064c', content: 'fav-content' },
  { id: 'f04a21ef-039f-4dd2-8de8-3a7a95007f23', content: 'fav-content' },
  { id: 'e8c800e0-361b-4f92-b0bd-54e8d0c3164f', content: 'fav-content' },
  { id: 'a84b9792-bbfe-4796-9a43-9f3be729edb1', content: 'fav-content' },
  { id: '3f4c3082-6ca7-49ca-97f3-95fc8265b718', content: 'fav-content' },
  { id: '77006831-d306-4d81-92a8-c9304f4a0eb8', content: 'fav-content' },
  { id: '2eed51fb-0685-40f3-abd2-4275df180f3a', content: 'fav-content' },
  { id: 'a4b8bd7b-d4f2-4bd9-b75b-fa6bad35dcf2', content: 'fav-content' },
  { id: 'c5915aa4-8a6c-41db-b5d0-7759088f0b11', content: 'fav-content' },
  { id: 'e77672ac-8c34-4286-9936-9cad03f73582', content: 'fav-content' },
  { id: 'd036ef9c-8891-4da3-8c95-59026b4c7a61', content: 'fav-content' },
  { id: 'ae9f92bd-e018-4e77-a390-f2c9e0c5c380', content: 'fav-content' },
  { id: 'd5b22d9f-5cf7-4c1f-ad95-2b7544674dcf', content: 'fav-content' },
  { id: 'aa654cd9-b8ef-46ef-9060-740a126708cc', content: 'fav-content' },
  { id: '601d8fa8-8ee6-43e7-9332-46260b45b6d2', content: 'fav-content' },
  { id: 'f8dc4366-7d17-47fc-8f53-6f4f0a8927f7', content: 'fav-content' },
  { id: '03c832b9-dc15-4470-89df-865a08c09c23', content: 'fav-content' },
  { id: 'a7767c37-f110-4b5e-8b95-2f1c254ba2e1', content: 'fav-content' },
  { id: '937ac671-8a4d-48f0-b5b0-fd25deb87a7b', content: 'fav-content' },
  { id: 'ba1a44ae-9322-4f5c-83d1-06e7a25459f0', content: 'fav-content' },
  { id: 'cf9e94c3-3224-4151-b851-7de4dc4ea3f9', content: 'fav-content' },
  { id: 'c73e6aa6-c6b1-4784-a976-784c5210fb8c', content: 'fav-content' },
  { id: '11fc0191-1522-49ec-b5bf-91dae6f3a4a3', content: 'fav-content' },
  { id: '177d74c1-9f0b-4d92-9c09-f03bf25b8e9d', content: 'fav-content' },
  { id: '88c141d0-022b-4a20-8308-abb92ddbc2b0', content: 'fav-content' },
  { id: '072d9fb9-52d7-403c-8aca-7a163bc8d359', content: 'fav-content' },
  { id: 'd0412895-7b51-466a-b32d-6eb532178ca6', content: 'fav-content' },
  { id: 'e4fa1ef7-f66b-4ddc-aac7-5b52e5fae6ef', content: 'fav-content' },
  { id: '4e187560-8819-40f6-9e21-3a4e097cfe17', content: 'fav-content' },
  { id: '2d1223ef-c843-4ccd-ac80-81c312166989', content: 'fav-content' },
  { id: '8d49b3bb-9d80-4580-8ac5-82657849008f', content: 'fav-content' },
  { id: 'f57e5806-f358-44ab-ad24-adf50863b07a', content: 'return 1;' },
  { id: 'd5047ff6-1aa6-48e6-a567-a9fe23c25555', content: ':server switch fail' }
]
