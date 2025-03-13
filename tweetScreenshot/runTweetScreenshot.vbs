Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c uvicorn tweet_api:app --reload", 0, False