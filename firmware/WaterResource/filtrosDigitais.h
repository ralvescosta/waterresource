/*
By, Santos CRB Soft, 2018
Version 1.0
*/
#ifndef _filtrosDigitais_SantosCRB 
#define _filtrosDigitais_SantosCRB
#include <Arduino.h>
class FPB
{
public:
  FPB();                      //construtor
  ~FPB();                     //destrutor
  //void setup()
  void setAlpha(double alpha);
  //void loop()
  double retValue(double value);
private:
  double _alpha;
  boolean _isFirstRun;
  double _prevX;
};
class MediaMovel
{
public:
  MediaMovel();
  ~MediaMovel();
  //void setup()
  void setDimension(byte dimension);
  //void loop()
  double retValue(double value);
private:
  byte _dimension;
  byte _ponteiro;
  double _vetor[255];
  boolean _isFirstRun;
};
#endif
