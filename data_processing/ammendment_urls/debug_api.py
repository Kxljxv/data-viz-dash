import asyncio
import aiohttp
import sys
import os
import json

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common

async def test_auth():
    print("[*] Testing authentication and API access...")
    
    # 1. Check if cookies are loaded
    cookies = common.load_cookies()
    if not cookies:
        print("[-] Error: No cookies found in cookies.json!")
        return

    async with await common.create_aiohttp_session() as session:
        # 2. Try to access the protected REST endpoint
        url = f"https://berlin.antragsgruen.de/rest/{common.CONVENTION_ID}"
        print(f"[*] Accessing {url}...")
        
        try:
            async with session.get(url, headers=common.get_headers(), timeout=10) as resp:
                print(f"[*] Status Code: {resp.status}")
                print(f"[*] Headers: {dict(resp.headers)}")
                
                content = await resp.text()
                print(f"[*] Response Preview (first 200 chars): {content[:200]}")
                
                if resp.status == 200:
                    try:
                        data = await resp.json()
                        print("[+] SUCCESS: API returned valid JSON.")
                        print(f"[+] Data keys: {list(data.keys())}")
                        print(f"[+] Title: {data.get('title')}")
                        motion_links = data.get('motion_links', [])
                        print(f"[+] Motions found: {len(motion_links)}")
                        
                        if motion_links:
                            m = motion_links[0]
                            print(f"[*] First motion data: {m}")
                            # Try to extract slug or id
                            m_slug = m.get('slug')
                            m_id = m.get('id')
                            
                            if not m_slug and m_id:
                                # Sometimes the API uses ID instead of slug in REST paths
                                m_slug = str(m_id)
                                
                            print(f"[*] Testing motion identifier: {m_slug}")
                            m_url = f"https://berlin.antragsgruen.de/rest/{common.CONVENTION_ID}/motion/{m_slug}"
                            async with session.get(m_url, headers=common.get_headers()) as mresp:
                                print(f"[*] Motion Status: {mresp.status}")
                                if mresp.status == 200:
                                    mdata = await mresp.json()
                                    print(f"[+] Motion Data keys: {list(mdata.keys())}")
                                    am_links = mdata.get('amendment_links', [])
                                    print(f"[+] Amendments in this motion: {len(am_links)}")
                                    if am_links:
                                        print(f"[+] Sample amendment ID: {am_links[0].get('id')}")
                    except Exception as e:
                        print(f"[-] Error parsing JSON: {e}")
                elif resp.status == 403:
                    print("[-] FAILURE: Access Forbidden (403). Cookies might be invalid or insufficient.")
                elif resp.status == 404:
                    print("[-] FAILURE: Not Found (404). URL might be wrong.")
                else:
                    print(f"[-] FAILURE: Unexpected status code {resp.status}")
                    
        except Exception as e:
            print(f"[-] Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_auth())
