import requests

api_url = 'http://10.10.133.80:3003'

# # 请求查询所有用户数据
# response = requests.get(f'{api_url}/manager-users')
# data = response.json()
# print(data)

# # 请求查询单个用户数据
# username = 'admin'
# response = requests.get(f'{api_url}/manager-users/{username}')
# data = response.json()
# print(data)

# 请求增加单个用户数据
payload = {
'email' :'1772738271@qq.com'
}

response = requests.post(f'{api_url}/send-verification-code', json=payload)
data = response.json()
print(data)

