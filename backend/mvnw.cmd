@REM Maven Wrapper for Windows
@SET JAVA_CMD=java
@IF NOT "%JAVA_HOME%"=="" SET JAVA_CMD="%JAVA_HOME%\bin\java"

@SET WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"

@IF NOT EXIST %WRAPPER_JAR% (
  echo Downloading Maven Wrapper...
  powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar' -OutFile %WRAPPER_JAR%"
)

%JAVA_CMD% -jar %WRAPPER_JAR% %*
